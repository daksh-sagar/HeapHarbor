package data

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgxpool"
)

type TagModel struct {
	DB *pgxpool.Pool
}

func (m *TagModel) GetPopular() ([]*Tag, error) {
	query := `
		SELECT
				t._id AS tag_id,
				t.name AS tag_name,
				COUNT(qt.questionId) AS question_count
		FROM
				tags t
		LEFT JOIN
				questionsTags qt ON t._id = qt.tagId
		GROUP BY
				t._id
		ORDER BY
				question_count DESC
		LIMIT
				7;
    `

	rows, err := m.DB.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var popularTags []*Tag

	for rows.Next() {
		var tag Tag
		if err := rows.Scan(&tag.Id, &tag.Name, &tag.QuestionsCount); err != nil {
			return nil, fmt.Errorf("error scanning tag row: %w", err)
		}
		popularTags = append(popularTags, &tag)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over tag rows: %w", err)
	}

	return popularTags, nil
}

func (m *TagModel) GetAll() ([]*Tag, error) {
	query := `
		SELECT
				_id,
				name,
				COUNT(qt.questionId) AS question_count
		FROM
				tags t
		LEFT JOIN
				questionsTags qt ON t._id = qt.tagId
		GROUP BY
				t._id
		ORDER BY
				question_count DESC;
  `

	rows, err := m.DB.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var tags []*Tag

	for rows.Next() {
		var tag Tag
		if err := rows.Scan(&tag.Id, &tag.Name, &tag.QuestionsCount); err != nil {
			return nil, fmt.Errorf("error scanning tag row: %w", err)
		}
		tags = append(tags, &tag)
	}

	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("error iterating over tag rows: %w", err)
	}

	return tags, nil
}
