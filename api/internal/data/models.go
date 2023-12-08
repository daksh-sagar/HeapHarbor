package data

import (
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrRecordNotFound = errors.New("record not found")
)

type Models struct {
	Questions QuestionModel
	Users     UserModel
}

func NewModels(db *pgxpool.Pool) Models {
	return Models{
		Questions: QuestionModel{DB: db},
		Users:     UserModel{DB: db},
	}
}
