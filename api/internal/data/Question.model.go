package data

import "time"

type Question struct {
	Id        int64     `json:"_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Tags      []Tag     `json:"tags"`
	Views     int       `json:"views"`
	Author    User      `json:"author"`
	AuthorId  int64     `json:"authorId"`
	Answers   []Answer  `json:"answers"`
	CreatedAt time.Time `json:"createdAt"`
	Upvotes   []int64   `json:"upvotes"`
	Downvotes []int64   `json:"downvotes"`
}

type CreateQuestionParams struct {
	Id       int64
	Title    string
	Content  string
	AuthorId int64
	Tags     []string
}

type QuestionVoteParams struct {
	Id         int64
	UserId     int64
	QuestionId int64
}
