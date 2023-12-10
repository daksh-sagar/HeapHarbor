package data

import (
	"context"
	"errors"

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
