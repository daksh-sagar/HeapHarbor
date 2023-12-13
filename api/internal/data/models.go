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
	Answers   AnswerModel
	Tags      TagModel
}

func NewModels(db *pgxpool.Pool) Models {
	return Models{
		Questions: QuestionModel{DB: db},
		Users:     UserModel{DB: db},
		Answers:   AnswerModel{DB: db},
		Tags:      TagModel{DB: db},
	}
}
