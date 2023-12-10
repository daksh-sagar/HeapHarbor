package main

import (
	"net/http"

	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() *httprouter.Router {
	router := httprouter.New()

	router.MethodNotAllowed = http.HandlerFunc(app.methodNotAllowedResponse)
	router.NotFound = http.HandlerFunc(app.notFoundResponse)

	router.HandlerFunc(http.MethodGet, "/v1/healthcheck", app.healthcheckHandler)

	router.HandlerFunc(http.MethodPost, "/v1/questions", app.createQuestion)
	router.HandlerFunc(http.MethodGet, "/v1/questions/:id", app.getQuestionById)
	router.HandlerFunc(http.MethodPost, "/v1/questions/:id/upvote", app.upvoteQuestion)
	router.HandlerFunc(http.MethodPost, "/v1/questions/:id/downvote", app.downvoteQuestion)
	router.HandlerFunc(http.MethodGet, "/v1/questions/:id/answers", app.getAnswers)

	router.HandlerFunc(http.MethodPost, "/v1/answers", app.createAnswer)

	router.HandlerFunc(http.MethodPost, "/v1/users", app.createUser)
	router.HandlerFunc(http.MethodGet, "/v1/users/:id", app.getUserByClerkId)

	return router

}
