package data

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type AnswerModel struct {
	DB *pgxpool.Pool
}

func (m *AnswerModel) Add(answer *CreateAnswerParams) error {
	stmt := `
    INSERT INTO answers (content, questionId, authorId)
    VALUES ($1, $2, $3)
    RETURNING _id
  `
	var _id int64

	err := m.DB.QueryRow(context.Background(), stmt, answer.Content, answer.QuestionId, answer.AuthorId).Scan(&_id)

	answer.Id = _id

	return err
}

func (m *AnswerModel) GetById(id int64) (*Answer, error) {
	query := `
        SELECT
            a._id, a.authorId,
            u.clerkId, u.name, u.picture,
            ARRAY(
                SELECT userId
                FROM answersUpvotes
                WHERE answerId = a._id
            ) AS upvotes,
            ARRAY(
                SELECT userId
                FROM answersDownvotes
                WHERE answerId = a._id
            ) AS downvotes,
            a.content
        FROM
            answers a
        JOIN
            users u ON a.authorId = u._id
        WHERE
            a._id = $1
    `

	row := m.DB.QueryRow(context.Background(), query, id)

	var answer Answer

	err := row.Scan(
		&answer.Id,
		&answer.Author.Id,
		&answer.Author.ClerkId,
		&answer.Author.Name,
		&answer.Author.Picture,
		&answer.Upvotes,
		&answer.Downvotes,
		&answer.Content,
	)

	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &answer, nil
}

func (m *AnswerModel) GetForAQuestion(questionId int64) ([]*Answer, error) {
	query := `
        SELECT
            a._id, a.authorId,
            u.clerkId, u.name, u.picture,
            ARRAY(
                SELECT userId
                FROM answersUpvotes
                WHERE answerId = a._id
            ) AS upvotes,
            ARRAY(
                SELECT userId
                FROM answersDownvotes
                WHERE answerId = a._id
            ) AS downvotes,
            a.content
        FROM
            answers a
        JOIN
            users u ON a.authorId = u._id
        WHERE
            a.questionId = $1
    `

	rows, err := m.DB.Query(context.Background(), query, questionId)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var answers []*Answer

	for rows.Next() {
		var answer Answer

		err := rows.Scan(
			&answer.Id,
			&answer.Author.Id,
			&answer.Author.ClerkId,
			&answer.Author.Name,
			&answer.Author.Picture,
			&answer.Upvotes,
			&answer.Downvotes,
			&answer.Content,
		)

		if err != nil {
			return nil, err
		}

		answers = append(answers, &answer)

	}

	return answers, nil

}

func (m *AnswerModel) GetByUserId(userId int64) ([]*Answer, error) {
	query := `
		SELECT
			a._id AS answer_id,
			a.questionId AS question_id,
			q.title AS question_title,
			q.authorId AS question_author_id,
			u.clerkId AS clerkId,
			u.name AS author_name,
			u.picture AS author_picture,
			ARRAY_REMOVE(ARRAY_AGG(DISTINCT au.userId), null) AS upvotes
		FROM
			answers a
		JOIN
			questions q ON a.questionId = q._id
		JOIN
			users u ON q.authorId = u._id
		LEFT JOIN
			answersUpvotes au ON a._id = au.answerId
		WHERE
			a.authorId = $1
		GROUP BY
			a._id, q._id, u._id;
	`

	rows, err := m.DB.Query(context.Background(), query, userId)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var answers []*Answer

	for rows.Next() {
		var answer Answer

		err := rows.Scan(
			&answer.Id,
			&answer.Question.Id,
			&answer.Question.Title,
			&answer.Author.Id,
			&answer.Author.ClerkId,
			&answer.Author.Name,
			&answer.Author.Picture,
			&answer.Upvotes,
		)

		if err != nil {
			return nil, err
		}

		answers = append(answers, &answer)
	}

	return answers, nil
}

func (m *AnswerModel) Upvote(upvote *AnswerVoteParams) (*AnswerVoteParams, error) {
	tx, err := m.DB.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return nil, err
	}

	defer tx.Rollback(context.Background())

	downvoteExists, err := m.checkDownvoteExists(tx, upvote.UserId, upvote.AnswerId)
	if err != nil {
		return nil, fmt.Errorf("error checking downvote: %w", err)
	}

	// If a downvote exists, remove it
	if downvoteExists {
		if err := m.deleteDownvote(tx, upvote.UserId, upvote.AnswerId); err != nil {
			return nil, fmt.Errorf("error deleting downvote: %w", err)
		}
	} else {
		upvoteExists, err := m.checkUpvoteExists(tx, upvote.UserId, upvote.AnswerId)
		if err != nil {
			return nil, fmt.Errorf("error checking upvote: %w", err)
		}

		// If an upvote exists, remove it and return
		if upvoteExists {
			if err := m.deleteUpvote(tx, upvote.UserId, upvote.AnswerId); err != nil {
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
			INSERT INTO answersUpvotes (userId, answerId)
			VALUES ($1, $2)
	`
	_, err = tx.Exec(context.Background(), stmt, upvote.UserId, upvote.AnswerId)
	if err != nil {
		return nil, fmt.Errorf("error inserting upvote: %w", err)
	}

	if err := tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("error committing transaction: %w", err)
	}

	return upvote, nil
}

func (m *AnswerModel) Downvote(downvote *AnswerVoteParams) (*AnswerVoteParams, error) {
	tx, err := m.DB.BeginTx(context.Background(), pgx.TxOptions{})
	if err != nil {
		return nil, err
	}

	defer tx.Rollback(context.Background())

	upvoteExists, err := m.checkUpvoteExists(tx, downvote.UserId, downvote.AnswerId)
	if err != nil {
		return nil, fmt.Errorf("error checking upvote: %w", err)
	}

	// If an upvote exists, remove it
	if upvoteExists {
		if err := m.deleteUpvote(tx, downvote.UserId, downvote.AnswerId); err != nil {
			return nil, fmt.Errorf("error deleting upvote: %w", err)
		}
	} else {
		downvoteExists, err := m.checkDownvoteExists(tx, downvote.UserId, downvote.AnswerId)
		if err != nil {
			return nil, fmt.Errorf("error checking downvote: %w", err)
		}

		if downvoteExists {
			if err := m.deleteDownvote(tx, downvote.UserId, downvote.AnswerId); err != nil {
				return nil, fmt.Errorf("error deleting downvote: %w", err)
			}
			if err := tx.Commit(context.Background()); err != nil {
				return nil, fmt.Errorf("error committing transaction: %w", err)
			}
			return downvote, nil
		}
	}

	stmt := `INSERT INTO answersDownvotes (userId, answerId)
					 VALUES ($1, $2)
	`

	_, err = tx.Exec(context.Background(), stmt, downvote.UserId, downvote.AnswerId)
	if err != nil {
		return nil, fmt.Errorf("error inserting downvote: %w", err)
	}

	if err := tx.Commit(context.Background()); err != nil {
		return nil, fmt.Errorf("error committing transaction: %w", err)
	}

	return downvote, nil
}

func (m *AnswerModel) checkDownvoteExists(tx pgx.Tx, userId, answerId int64) (bool, error) {
	stmt := `
			SELECT EXISTS (
					SELECT 1
					FROM answersDownvotes
					WHERE userId = $1 AND answerId = $2
			)
	`
	var exists bool
	err := tx.QueryRow(context.Background(), stmt, userId, answerId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (m *AnswerModel) deleteDownvote(tx pgx.Tx, userId, answerId int64) error {
	stmt := `
			DELETE FROM answersDownvotes
			WHERE userId = $1 AND answerId = $2
	`
	_, err := tx.Exec(context.Background(), stmt, userId, answerId)
	return err
}

func (m *AnswerModel) checkUpvoteExists(tx pgx.Tx, userId, answerId int64) (bool, error) {
	stmt := `
			SELECT EXISTS (
					SELECT 1
					FROM answersUpvotes
					WHERE userId = $1 AND answerId = $2
			)
	`
	var exists bool
	err := tx.QueryRow(context.Background(), stmt, userId, answerId).Scan(&exists)
	if err != nil {
		return false, err
	}
	return exists, nil
}

func (m *AnswerModel) deleteUpvote(tx pgx.Tx, userId, answerId int64) error {
	stmt := `
			DELETE FROM answersUpvotes
			WHERE userId = $1 AND answerId = $2
	`
	_, err := tx.Exec(context.Background(), stmt, userId, answerId)
	return err
}

func (m *AnswerModel) Delete(id int64) error {
	query := `
		DELETE FROM
			answers
		WHERE
			_id = $1
	`

	result, err := m.DB.Exec(context.Background(), query, id)

	if err != nil {
		return err
	}

	if rowsAffected := result.RowsAffected(); rowsAffected == 0 {
		return ErrRecordNotFound
	}

	return nil
}
