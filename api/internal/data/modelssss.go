package data

import "time"

type QuestionDB struct {
	ID        string    `json:"_id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Tags      []Tag     `json:"tags"`
	Views     int       `json:"views"`
	Author    User      `json:"author"`
	AuthorID  int64     `json:"authorId"`
	Answers   []Answer  `json:"answers"`
	CreatedAt time.Time `json:"createdAt"`
	Upvotes   []int64   `json:"upvotes"`
	Downvotes []int64   `json:"downvotes"`
}

type TagDb struct {
	ID          int64      `json:"_id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Questions   []Question `json:"-"`
	Followers   []int64    `json:"-"`
	CreatedAt   time.Time  `json:"createdAt"`
}

type Interaction struct {
	ID         int64     `db:"_id"`
	UserID     int64     `db:"userId"`
	Action     string    `db:"action"`
	QuestionID int64     `db:"questionId"`
	AnswerID   int64     `db:"answerId"`
	Tags       []int64   `db:"-"`
	CreatedAt  time.Time `db:"createdAt"`
}
