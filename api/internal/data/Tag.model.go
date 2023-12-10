package data

import "time"

type Tag struct {
	Id          int64     `json:"_id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Questions   []int64   `json:"questions"`
	CreatedAt   time.Time `json:"createdAt"`
}
