package main

import (
	"fmt"
	"net/http"
	"time"

	"github.com/daksh-sagar/HeapHarbor/api/internal/data"
)

func (app *application) createQuestion(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "create question handler")
}

func (app *application) getQuestionById(w http.ResponseWriter, r *http.Request) {

	id, err := app.readIdParam(r)

	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	question := data.Question{
		ID:        id,
		CreatedAt: time.Now(),
		Title:     "how do i represent the db models in Go",
		Content:   "I have a model in my db that looks like this: Question which references other models",
		Answers:   []int{1, 2, 3},
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"question": question}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) getAnswers(w http.ResponseWriter, r *http.Request) {

	id, err := app.readIdParam(r)

	if err != nil {
		http.NotFound(w, r)
		return
	}
	fmt.Fprintf(w, "get answers for question with id: %d\n", id)
}
