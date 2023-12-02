package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() *httprouter.Router {
	router := httprouter.New()

	router.HandlerFunc(http.MethodGet, "/v1/healthcheck", app.healthcheckHandler)

	router.HandlerFunc(http.MethodPost, "/v1/questions", app.createQuestion)
	router.HandlerFunc(http.MethodGet, "/v1/questions/:id", app.getQuestionById)
	router.HandlerFunc(http.MethodGet, "/v1/questions/:id/answers", app.getAnswers)

	return router

}
