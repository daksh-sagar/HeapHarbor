package main

import "net/http"

func (app *application) getPopularTags(w http.ResponseWriter, r *http.Request) {
	tags, err := app.models.Tags.GetPopular()
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"tags": tags}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) getAllTags(w http.ResponseWriter, r *http.Request) {
	tags, err := app.models.Tags.GetAll()
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"tags": tags}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}

}

func (app *application) getQuestionsByTagId(w http.ResponseWriter, r *http.Request) {
	id, err := app.readIdParam(r)
	if err != nil {
		app.notFoundResponse(w, r)
		return
	}

	questions, err := app.models.Questions.GetByTagId(id)
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"questions": questions}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}
