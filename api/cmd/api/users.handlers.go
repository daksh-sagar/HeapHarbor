package main

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/daksh-sagar/HeapHarbor/api/internal/data"
	"github.com/julienschmidt/httprouter"
)

func (app *application) createUser(w http.ResponseWriter, r *http.Request) {
	var input struct {
		ClerkId  string `json:"clerkId"`
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
		ClerkId:  input.ClerkId,
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
	headers.Set("Location", fmt.Sprintf("/v1/users/%d", user.Id))

	err = app.writeJSON(w, http.StatusCreated, envelope{"user": user}, headers)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) getUserByClerkId(w http.ResponseWriter, r *http.Request) {
	params := httprouter.ParamsFromContext(r.Context())
	id := params.ByName("id")
	if id == "" {
		app.notFoundResponse(w, r)
		return
	}

	user, err := app.models.Users.GetByClerkId(id)

	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.notFoundResponse(w, r)
		default:
			app.serverErrorResponse(w, r, err)
		}
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"user": user}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

}
