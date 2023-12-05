package data

import "time"

type Question struct {
	ID        int64     `json:"id"`
	Title     string    `json:"title"`
	Content   string    `json:"content"`
	Tags      []int     `json:"tags"`
	Views     int       `json:"views"`
	Upvotes   []int     `json:"upvotes"`
	Downvotes []int     `json:"downvotes"`
	Author    int       `json:"author"` // TODO: change this to User type once we have modelled User table
	Answers   []int     `json:"answers"`
	CreatedAt time.Time `json:"-"`
}
