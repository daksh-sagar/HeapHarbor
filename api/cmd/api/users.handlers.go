package main

import (
	"fmt"
	"net/http"

	"github.com/daksh-sagar/HeapHarbor/api/internal/data"
)

func (app *application) createUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ClerkID  string `json:"clerkId"`
		Username string `json:"username"`
		Name     string `json:"name"`
		Email    string `json:"email"`
		Picture  string `json:"picture"`
	}

	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestError(w, r, err)
	}

	user := &data.User{
		ClerkID:  input.ClerkID,
		Username: input.Username,
		Name:     input.Name,
		Email:    input.Email,
		Picture:  input.Picture,
	}

	err = app.models.Users.Add(user)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	headers := make(http.Header)
	headers.Set("Location", fmt.Sprintf("/v1/users/%d", user.ID))

	err = app.writeJSON(w, http.StatusCreated, envelope{"user": user}, headers)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
