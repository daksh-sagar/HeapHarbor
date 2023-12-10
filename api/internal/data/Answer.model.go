package data

import "time"

type Answer struct {
	Id         int64     `json:"_id"`
	Author     User      `json:"author"`
	AuthorId   int64     `json:"authorId"`
	Question   Question  `json:"question"`
	QuestionId int64     `json:"questionId"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"createdAt"`
	Upvotes    []int64   `json:"upvotes"`
	Downvotes  []int64   `json:"downvotes"`
}

type CreateAnswerParams struct {
	Id         int64
	AuthorId   int64
	QuestionId int64
	Content    string
}

type AnswerVoteParams struct {
	UserId   int64
	AnswerId int64
}
