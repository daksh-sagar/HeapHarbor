package data

import "time"

type User struct {
	Id         int64       `json:"_id"`
	ClerkId    string      `json:"clerkId"`
	Name       string      `json:"name"`
	Username   string      `json:"username"`
	Email      string      `json:"email"`
	Bio        string      `json:"bio"`
	Picture    string      `json:"picture"`
	Location   string      `json:"location"`
	Website    string      `json:"website"`
	Reputation int         `json:"reputation"`
	JoinedAt   time.Time   `json:"joinedAt"`
	SavedIds   []int64     `json:"savedIds"`
	Saved      []*Question `json:"saved"`
}
