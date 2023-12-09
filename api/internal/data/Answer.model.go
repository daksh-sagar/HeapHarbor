package data

import "time"

type Answer struct {
	ID         string    `json:"_id"`
	Author     User      `json:"author"`
	AuthorID   int64     `json:"authorId"`
	Question   Question  `json:"question"`
	QuestionID int64     `json:"questionId"`
	Content    string    `json:"content"`
	CreatedAt  time.Time `json:"createdAt"`
	Upvotes    []int64   `json:"upvotes"`
	Downvotes  []int64   `json:"downvotes"`
}
