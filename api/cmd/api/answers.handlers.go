package main

import (
	"fmt"
	"net/http"

	"github.com/daksh-sagar/HeapHarbor/api/internal/data"
)

func (app *application) createAnswer(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Content    string `json:"content"`
		QuestionId int64  `json:"questionId"`
		AuthorId   int64  `json:"authorId"`
	}

	err := app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestError(w, r, err)
	}

	answer := &data.CreateAnswerParams{
		Content:    input.Content,
		AuthorId:   input.AuthorId,
		QuestionId: input.QuestionId,
	}

	err = app.models.Answers.Add(answer)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	headers := make(http.Header)
	headers.Set("Location", fmt.Sprintf("/v1/answers/%d", answer.Id))

	err = app.writeJSON(w, http.StatusCreated, envelope{"answer": answer}, headers)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
