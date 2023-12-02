package main

import (
	"fmt"
	"net/http"
)

func (app *application) createQuestion(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "create question handler")
}

func (app *application) getQuestionById(w http.ResponseWriter, r *http.Request) {

	id, err := app.readIdParam(r)

	if err != nil {
		http.NotFound(w, r)
		return
	}
	fmt.Fprintf(w, "get question with id: %d\n", id)
}

func (app *application) getAnswers(w http.ResponseWriter, r *http.Request) {

	id, err := app.readIdParam(r)

	if err != nil {
		http.NotFound(w, r)
		return
	}
	fmt.Fprintf(w, "get answers for question with id: %d\n", id)
}
