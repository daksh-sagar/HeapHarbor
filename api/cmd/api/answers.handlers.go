package main

import (
	"errors"
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

func (app *application) upvoteAnswer(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIdParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	var input struct {
		UserId int64 `json:"userId"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	vote := &data.AnswerVoteParams{
		AnswerId: id,
		UserId:   input.UserId,
	}

	upvote, err := app.models.Answers.Upvote(vote)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"upvote": upvote}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) downvoteAnswer(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIdParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}
	var input struct {
		UserId int64 `json:"userId"`
	}

	err = app.readJSON(w, r, &input)
	if err != nil {
		app.badRequestError(w, r, err)
		return
	}

	vote := &data.AnswerVoteParams{
		AnswerId: id,
		UserId:   input.UserId,
	}

	downvote, err := app.models.Answers.Downvote(vote)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"downvote": downvote}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) deleteAnswer(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIdParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	err = app.models.Answers.Delete(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.notFoundResponse(w, r)
		default:
			app.serverErrorResponse(w, r, err)
		}
		return
	}

	err = app.writeJSON(w, http.StatusNoContent, envelope{}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
