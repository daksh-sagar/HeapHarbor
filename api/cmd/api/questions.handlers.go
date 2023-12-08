package main

import (
	"fmt"
	"net/http"

	"github.com/daksh-sagar/HeapHarbor/api/internal/data"
)

func (app *application) createQuestion(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Title    string   `json:"title"`
		Content  string   `json:"content"`
		AuthorId int64    `json:"authorId"`
		Tags     []string `json:"tags"`
	}

	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestError(w, r, err)
	}

	question := &data.CreateQuestionParams{
		Title:    input.Title,
		Content:  input.Content,
		AuthorId: input.AuthorId,
		Tags:     input.Tags,
	}

	err = app.models.Questions.Insert(question)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	headers := make(http.Header)
	headers.Set("Location", fmt.Sprintf("/v1/questions/%d", question.ID))

	err = app.writeJSON(w, http.StatusCreated, envelope{"question": question}, headers)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) getQuestionById(w http.ResponseWriter, r *http.Request) {
}

func (app *application) getAnswers(w http.ResponseWriter, r *http.Request) {

	id, err := app.readIdParam(r)

	if err != nil {
		http.NotFound(w, r)
		return
	}
	fmt.Fprintf(w, "get answers for question with id: %d\n", id)
}