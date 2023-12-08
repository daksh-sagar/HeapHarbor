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
	question.ID = _id

	return err
}

func (m QuestionModel) GetAll() ([]*Question, error) {
	return nil, nil
}

func (m QuestionModel) GetById(id int64) (*Question, error) {
	return nil, nil
}

func (m QuestionModel) Update(question *Question) error {
	return nil
}

func (m QuestionModel) Delete(id int64) error {
	return nil
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

	var questionID int64
	err = tx.QueryRow(context.Background(), stmt, question.Title, question.Content, question.AuthorId).Scan(&questionID)
	if err != nil {
		tx.Rollback(context.Background())
		return fmt.Errorf("error adding question: %w", err)
	}

	// Update the question ID
	question.ID = questionID

	// Loop through provided tag names
	for _, tag := range question.Tags {
		// Get existing tag by name
		existingTag, err := m.getExistingTag(tx, tag)
		if err != nil {
			tx.Rollback(context.Background())
			return fmt.Errorf("error getting tag: %w", err)
		}

		// Associate the question with the existing or newly created tag
		err = m.associateQuestionTag(tx, questionID, existingTag.ID)
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
		&tag.ID,
	)

	if err != nil {
		if errors.Is(err, pgx.ErrNoRows) {
			// Create new tag if it doesn't exist
			stmt := `
        INSERT INTO tags (name)
        VALUES ($1)
        RETURNING _id
      `

			var tagID int64
			err = tx.QueryRow(context.Background(), stmt, name).Scan(&tagID)
			if err != nil {
				return nil, fmt.Errorf("error creating tag: %w", err)
			}

			// Update tag with ID
			tag.ID = tagID
			tag.Name = name
		} else {
			return nil, fmt.Errorf("error getting tag: %w", err)
		}
	}

	return &tag, nil
}

// Associate question with existing or newly created tag
func (m QuestionModel) associateQuestionTag(tx pgx.Tx, questionID, tagID int64) error {
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
	err := tx.QueryRow(context.Background(), stmt, questionID, tagID).Scan(
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

			err = tx.QueryRow(context.Background(), stmt, questionID, tagID).Scan()
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