package main

import (
	"errors"
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
	headers.Set("Location", fmt.Sprintf("/v1/questions/%d", question.Id))

	err = app.writeJSON(w, http.StatusCreated, envelope{"question": question}, headers)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) getQuestionById(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIdParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	question, err := app.models.Questions.GetById(id)
	if err != nil {
		switch {
		case errors.Is(err, data.ErrRecordNotFound):
			app.notFoundResponse(w, r)
		default:
			app.serverErrorResponse(w, r, err)
		}
		return
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

	answers, err := app.models.Answers.GetForAQuestion(id)

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"answers": answers}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) upvoteQuestion(w http.ResponseWriter, r *http.Request) {
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
	}

	vote := &data.QuestionVoteParams{
		UserId:     input.UserId,
		QuestionId: id,
	}

	upvote, err := app.models.Questions.Upvote(vote)

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"upvote": upvote}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

}

func (app *application) downvoteQuestion(w http.ResponseWriter, r *http.Request) {
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
	}

	vote := &data.QuestionVoteParams{
		UserId:     input.UserId,
		QuestionId: id,
	}

	downvote, err := app.models.Questions.Downvote(vote)

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"downvote": downvote}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

}

func (app *application) deleteQuestion(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIdParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	err = app.models.Questions.Delete(id)
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

func (app *application) getHotQuestions(w http.ResponseWriter, r *http.Request) {
	questions, err := app.models.Questions.GetHotQuestions()

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"questions": questions}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) toggleSaveQuestion(w http.ResponseWriter, r *http.Request) {
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
	}

	err = app.models.Questions.ToggleSave(id, input.UserId)

	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

}
