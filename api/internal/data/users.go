package data

import (
	"context"

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
	err := m.DB.QueryRow(context.Background(), stmt, user.ClerkID, user.Name, user.Username, user.Email, user.Picture).Scan(&_id)

	user.ID = _id

	return err
}
