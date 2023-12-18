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
	router.HandlerFunc(http.MethodGet, "/v1/popular/questions", app.getHotQuestions) // * this is to prevent conflicting routes panic from httprouter
	router.HandlerFunc(http.MethodDelete, "/v1/questions/:id", app.deleteQuestion)
	router.HandlerFunc(http.MethodPost, "/v1/questions/:id/upvote", app.upvoteQuestion)
	router.HandlerFunc(http.MethodPost, "/v1/questions/:id/downvote", app.downvoteQuestion)
	router.HandlerFunc(http.MethodGet, "/v1/questions/:id/answers", app.getAnswers)

	router.HandlerFunc(http.MethodPost, "/v1/answers", app.createAnswer)
	router.HandlerFunc(http.MethodDelete, "/v1/answers/:id", app.deleteAnswer)
	router.HandlerFunc(http.MethodPost, "/v1/answers/:id/upvote", app.upvoteAnswer)
	router.HandlerFunc(http.MethodPost, "/v1/answers/:id/downvote", app.downvoteAnswer)

	router.HandlerFunc(http.MethodPost, "/v1/users", app.createUser)
	router.HandlerFunc(http.MethodGet, "/v1/users", app.getAllUsers)
	router.HandlerFunc(http.MethodGet, "/v1/users/:id", app.getUserByClerkId)
	router.HandlerFunc(http.MethodGet, "/v1/users/:id/questions", app.getUserQuestions)
	router.HandlerFunc(http.MethodGet, "/v1/users/:id/answers", app.getUserAnswers)
	router.HandlerFunc(http.MethodGet, "/v1/users/:id/saved", app.getUserSavedQuestions)

	router.HandlerFunc(http.MethodGet, "/v1/tags", app.getAllTags)
	router.HandlerFunc(http.MethodGet, "/v1/popular/tags", app.getPopularTags) // * this is to prevent conflicting routes panic from httprouter
	router.HandlerFunc(http.MethodGet, "/v1/tags/:id/questions", app.getQuestionsByTagId)

	return router

}
