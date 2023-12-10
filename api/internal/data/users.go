package data

import (
	"context"
	"errors"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type UserModel struct {
	DB *pgxpool.Pool
}

func (m *UserModel) Add(user *User) error {
	stmt := `
    INSERT INTO users (clerkId, name, username, email, picture)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING _id
  `
	var _id int64
	err := m.DB.QueryRow(context.Background(), stmt, user.ClerkId, user.Name, user.Username, user.Email, user.Picture).Scan(&_id)

	user.Id = _id

	return err
}

func (m *UserModel) GetByClerkId(id string) (*User, error) {
	query := `
					SELECT
					u._id, u.clerkId, u.name, u.username, u.email,
					COALESCE(u.bio, ''), COALESCE(u.picture, ''), COALESCE(u.location, ''), COALESCE(u.portfolioWebsite, ''),
					u.reputation,
            ARRAY(
                SELECT questionId
                FROM usersSavedQuestions
                WHERE userId = u._id
            ) AS saved_ids
        FROM
            users u
        WHERE
            u.clerkId = $1
    `

	row := m.DB.QueryRow(context.Background(), query, id)

	// Create a User struct to hold the fetched user data
	var user User

	// Scan the row into the User struct
	err := row.Scan(
		&user.Id,
		&user.ClerkId,
		&user.Name,
		&user.Username,
		&user.Email,
		&user.Bio,
		&user.Picture,
		&user.Location,
		&user.Website,
		&user.Reputation,
		&user.SavedIds, // Scan the saved question IDs into a slice
	)
	if err != nil {
		switch {
		case errors.Is(err, pgx.ErrNoRows):
			return nil, ErrRecordNotFound
		default:
			return nil, err
		}
	}

	return &user, nil
}
