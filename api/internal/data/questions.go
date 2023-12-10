package data

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type QuestionModel struct {
	DB *pgxpool.Pool
}

func (m QuestionModel) Add(question *Question) error {
	stmt := `
    INSERT INTO questions (title, content, authorId)
    VALUES ($1, $2, $3)
    RETURNING _id
  `
	var _id int64

	err := m.DB.QueryRow(context.Background(), stmt, question.Title, question.Content, question.AuthorId).Scan(&_id)

	// Update question ID with inserted value
	question.Id = _id

	return err
}

func (m QuestionModel) GetAll() ([]*Question, error) {
	return nil, nil
}

func (m QuestionModel) GetById(id int64) (*Question, error) {
	if id < 1 {
		return nil, ErrRecordNotFound
	}

	query := `
        SELECT
            q._id,
            q.title,
            q.content,
            q.views,
            u._id as author_id,
            u.name as author_name,
            u.clerkId as author_clerk_id,
            u.picture as author_picture,
            ARRAY(
                SELECT uup._id
                FROM users uup
                JOIN questionsUpvotes qu ON uup._id = qu.userId
                WHERE qu.questionId = q._id
            ) AS upvotes,
            ARRAY(
                SELECT udown._id
                FROM users udown
                JOIN questionsDownvotes qd ON udown._id = qd.userId
                WHERE qd.questionId = q._id
            ) AS downvotes,
            ARRAY(
                SELECT t._id
                FROM tags t
                JOIN questionsTags qt ON t._id = qt.tagId
                WHERE qt.questionId = q._id
            ) AS tagsIds,
						ARRAY(
                SELECT t.name
                FROM tags t
                JOIN questionsTags qt ON t._id = qt.tagId
                WHERE qt.questionId = q._id
            ) AS tagsNames
        FROM questions q
        JOIN users u ON q.authorId = u._id
        WHERE q._id = $1
    `

	// Execute the query to fetch the question data
	var question Question
	var tagIds []int64
	var tagNames []string
	err := m.DB.QueryRow(context.Background(), query, id).Scan(
		&question.Id,
		&question.Title,
		&question.Content,
		&question.Views,
		&question.Author.Id,
		&question.Author.Name,
		&question.Author.ClerkId,
		&question.Author.Picture,
		&question.Upvotes,
		&question.Downvotes,
		&tagIds,
		&tagNames,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	for i, id := range tagIds {
		tag := Tag{
			Id:   id,
			Name: tagNames[i],
		}
		question.Tags = append(question.Tags, tag)
	}

	return &question, nil
}

func (m *QuestionModel) GetByUserId(id int64) ([]*Question, error) {
	// Prepare the query to fetch questions by user ID along with aggregated tag IDs and names
	query := `
			SELECT
					q._id, q.title,
					ARRAY_AGG(t._id) AS tag_ids,
					ARRAY_AGG(t.name) AS tag_names,
					u._id, u.clerkId, u.name, u.picture
			FROM
					questions q
			JOIN
					users u ON q.authorId = u._id
			LEFT JOIN
					questionsTags qt ON q._id = qt.questionId
			LEFT JOIN
					tags t ON qt.tagId = t._id
			WHERE
					q.authorId = $1
			GROUP BY
					q._id, u._id
	`

	// Execute the query to fetch questions by user ID
	rows, err := m.DB.Query(context.Background(), query, id)
	if err != nil {
		return nil, fmt.Errorf("error fetching questions: %w", err)
	}
	defer rows.Close()

	// Create a slice to hold the fetched questions
	var questions []*Question

	// Iterate through the rows and populate the questions slice
	for rows.Next() {
		var question Question
		var tagIds []int64
		var tagNames []string
		var author User

		// Scan the row into the Question, tag IDs, tag names, and User structs
		err := rows.Scan(
			&question.Id,
			&question.Title,
			&tagIds,
			&tagNames,
			&author.Id,
			&author.ClerkId,
			&author.Name,
			&author.Picture,
		)
		if err != nil {
			return nil, fmt.Errorf("error scanning row: %w", err)
		}

		// Populate tags for the question from aggregated arrays
		for i, tagId := range tagIds {
			question.Tags = append(question.Tags, Tag{Id: tagId, Name: tagNames[i]})
		}

		// Set the author for the question
		question.Author = author

		// Append the question to the questions slice
		questions = append(questions, &question)
	}

	// Check for any errors encountered during rows iteration
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating through rows: %w", err)
	}

	return questions, nil
}

func (m QuestionModel) Update(question *Question) error {
	return nil
}

func (m QuestionModel) Delete(id int64) error {
	return nil
}

func (m *QuestionModel) Upvote(upvote *QuestionVoteParams) (*QuestionVoteParams, error) {
	tx, err := m.DB.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return nil, err
	}

	defer tx.Rollback(context.Background())

	downvoteExists, err := m.checkDownvoteExists(tx, upvote.UserId, upvote.QuestionId)
	if err != nil {
		return nil, fmt.Errorf("error checking downvote: %w", err)
	}

	// If a downvote exists, remove it
	if downvoteExists {
		if err := m.deleteDownvote(tx, upvote.UserId, upvote.QuestionId); err != nil {
			return nil, fmt.Errorf("error deleting downvote: %w", err)
		}
	} else {
		upvoteExists, err := m.checkUpvoteExists(tx, upvote.UserId, upvote.QuestionId)
		if err != nil {
			return nil, fmt.Errorf("error checking upvote: %w", err)
		}

		// If an upvote exists, remove it and return
		if upvoteExists {
			if err := m.deleteUpvote(tx, upvote.UserId, upvote.QuestionId); err != nil {
				return nil, fmt.Errorf("error deleting upvote: %w", err)
			}
			if err := tx.Commit(context.Background()); err != nil {
				return nil, fmt.Errorf("error committing transaction: %w", err)
			}
			return upvote, nil
		}
	}

	// Insert the upvote if it doesn't exist
	stmt := `
			INSERT INTO questionsUpvotes (userId, questionId)
			VALUES ($1, $2)
	`
	_, err = tx.Exec(context.Background(), stmt, upvote.UserId, upvote.QuestionId)
	if err != nil {
		return nil, fmt.Errorf("error inserting upvote: %w", err)
	}

	if err := tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("error committing transaction: %w", err)
	}

	return upvote, nil
}

func (m *QuestionModel) Downvote(downvote *QuestionVoteParams) (*QuestionVoteParams, error) {
	tx, err := m.DB.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return nil, err
	}

	defer tx.Rollback(context.Background())

	upvoteExists, err := m.checkUpvoteExists(tx, downvote.UserId, downvote.QuestionId)
	if err != nil {
		return nil, fmt.Errorf("error checking upvote: %w", err)
	}

	// If an upvote exists, remove it
	if upvoteExists {
		if err := m.deleteUpvote(tx, downvote.UserId, downvote.QuestionId); err != nil {
			return nil, fmt.Errorf("error deleting upvote: %w", err)
		}
	} else {
		downvoteExists, err := m.checkDownvoteExists(tx, downvote.UserId, downvote.QuestionId)
		if err != nil {
			return nil, fmt.Errorf("error checking downvote: %w", err)
		}

		if downvoteExists {
			if err := m.deleteDownvote(tx, downvote.UserId, downvote.QuestionId); err != nil {
				return nil, fmt.Errorf("error deleting downvote: %w", err)
			}
			if err := tx.Commit(context.Background()); err != nil {
				return nil, fmt.Errorf("error committing transaction: %w", err)
			}
			return downvote, nil
		}
	}

	stmt := `INSERT INTO questionsDownvotes (userId, questionId)
					 VALUES ($1, $2)
	`

	_, err = tx.Exec(context.Background(), stmt, downvote.UserId, downvote.QuestionId)
	if err != nil {
		return nil, fmt.Errorf("error inserting downvote: %w", err)
	}

	if err := tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("error committing transaction: %w", err)
	}

	return downvote, nil
}

func (m *QuestionModel) checkDownvoteExists(tx pgx.Tx, userId, questionId int64) (bool, error) {
	stmt := `
			SELECT EXISTS (
					SELECT 1
					FROM questionsDownvotes
					WHERE userId = $1 AND questionId = $2
			)
	`
	var exists bool
	err := tx.QueryRow(context.Background(), stmt, userId, questionId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (m *QuestionModel) deleteDownvote(tx pgx.Tx, userId, questionId int64) error {
	stmt := `
			DELETE FROM questionsDownvotes
			WHERE userId = $1 AND questionId = $2
	`
	_, err := tx.Exec(context.Background(), stmt, userId, questionId)
	return err
}

func (m *QuestionModel) checkUpvoteExists(tx pgx.Tx, userId, questionId int64) (bool, error) {
	stmt := `
			SELECT EXISTS (
					SELECT 1
					FROM questionsUpvotes
					WHERE userId = $1 AND questionId = $2
			)
	`
	var exists bool
	err := tx.QueryRow(context.Background(), stmt, userId, questionId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (m *QuestionModel) deleteUpvote(tx pgx.Tx, userId, questionId int64) error {
	stmt := `
			DELETE FROM questionsUpvotes
			WHERE userId = $1 AND questionId = $2
	`
	_, err := tx.Exec(context.Background(), stmt, userId, questionId)
	return err
}

func (m QuestionModel) Insert(question *CreateQuestionParams) error {

	// Start a transaction to ensure data consistency
	tx, err := m.DB.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return fmt.Errorf("error starting transaction: %w", err)
	}

	// Insert the question data
	stmt := `
    INSERT INTO questions (title, content, authorId)
    VALUES ($1, $2, $3)
    RETURNING _id
  `

	var questionId int64
	err = tx.QueryRow(context.Background(), stmt, question.Title, question.Content, question.AuthorId).Scan(&questionId)
	if err != nil {
		tx.Rollback(context.Background())
		return fmt.Errorf("error adding question: %w", err)
	}

	// Update the question ID
	question.Id = questionId

	// Loop through provided tag names
	for _, tag := range question.Tags {
		// Get existing tag by name
		existingTag, err := m.getExistingTag(tx, tag)
		if err != nil {
			tx.Rollback(context.Background())
			return fmt.Errorf("error getting tag: %w", err)
		}

		// Associate the question with the existing or newly created tag
		err = m.associateQuestionTag(tx, questionId, existingTag.Id)
		if err != nil {
			tx.Rollback(context.Background())
			return fmt.Errorf("error associating question-tag: %w", err)
		}
	}

	// Commit the transaction if all operations were successful
	err = tx.Commit(context.Background())
	if err != nil {
		return fmt.Errorf("error committing transaction: %w", err)
	}

	return nil
}

// Get existing tag by name
func (m QuestionModel) getExistingTag(tx pgx.Tx, name string) (*Tag, error) {
	// Check if tag exists
	stmt := `
    SELECT _id
    FROM tags
    WHERE name = $1
  `

	var tag Tag
	err := tx.QueryRow(context.Background(), stmt, name).Scan(
		&tag.Id,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Create new tag if it doesn't exist
			stmt := `
        INSERT INTO tags (name)
        VALUES ($1)
        RETURNING _id
      `

			var tagId int64
			err = tx.QueryRow(context.Background(), stmt, name).Scan(&tagId)
			if err != nil {
				return nil, fmt.Errorf("error creating tag: %w", err)
			}

			// Update tag with ID
			tag.Id = tagId
			tag.Name = name
		} else {
			return nil, fmt.Errorf("error getting tag: %w", err)
		}
	}

	return &tag, nil
}

// Associate question with existing or newly created tag
func (m QuestionModel) associateQuestionTag(tx pgx.Tx, questionId, tagId int64) error {
	// Check if association already exists
	stmt := `
    SELECT questionId, tagId 
    FROM questionsTags
    WHERE questionId = $1 AND tagId = $2
  `

	var existingAssociation struct {
		QuestionId int64
		TagId      int64
	}
	err := tx.QueryRow(context.Background(), stmt, questionId, tagId).Scan(
		&existingAssociation.QuestionId,
		&existingAssociation.TagId,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Insert new association
			stmt = `
        INSERT INTO questionsTags (questionId, tagId)
        VALUES ($1, $2)
      `

			_, err = tx.Exec(context.Background(), stmt, questionId, tagId)
			if err != nil {
				return fmt.Errorf("error associating question-tag: %w", err)
			}
			return nil
		}
		return fmt.Errorf("error checking existing association: %w", err)
	}

	// Association already exists
	return nil
}
