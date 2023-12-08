package main

import (
	"context"
	"flag"
	"fmt"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/daksh-sagar/HeapHarbor/api/internal/data"
	"github.com/jackc/pgx/v5/pgxpool"
)

const version = "1.0.0"

type config struct {
	port int
	env  string
	db   struct {
		dsn          string
		maxOpenConns int
		// maxIdleConns int32 - not supported by pgxpool
		maxIdleTime time.Duration
	}
}

type application struct {
	config config
	logger *slog.Logger
	models data.Models
}

func main() {
	var cfg config

	flag.IntVar(&cfg.port, "port", 4000, "API server port")
	flag.StringVar(&cfg.env, "env", "development", "App environment (development|staging|production)")
	flag.StringVar(&cfg.db.dsn, "dsn", "postgres://root:pa55word@localhost:5432/heapharbor?sslmode=disable", "PostgreSQL DSN")
	flag.IntVar(&cfg.db.maxOpenConns, "db-max-open-conns", 25, "PostgreSQL max open connections")
	flag.DurationVar(&cfg.db.maxIdleTime, "db-max-idle-time", 15*time.Minute, "PostgreSQL max connection idle time")

	flag.Parse()
	logger := slog.New(slog.NewTextHandler(os.Stdout, nil))

	db, err := openDB(&cfg)

	if err != nil {
		logger.Error(err.Error())
		os.Exit(1)
	}

	defer db.Close()

	logger.Info("database connection pool established")

	app := &application{
		config: cfg,
		logger: logger,
		models: data.NewModels(db),
	}

	srv := &http.Server{
		Addr:         fmt.Sprintf(":%d", cfg.port),
		Handler:      app.routes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
		ErrorLog:     slog.NewLogLogger(app.logger.Handler(), slog.LevelError),
	}

	app.logger.Info("starting server", "addr", srv.Addr, "env", cfg.env)

	err = srv.ListenAndServe()
	app.logger.Error(err.Error())
	os.Exit(1)

}

func openDB(cfg *config) (*pgxpool.Pool, error) {
	dbConfig, _ := pgxpool.ParseConfig(cfg.db.dsn)
	dbConfig.MaxConns = int32(cfg.db.maxOpenConns)
	dbConfig.MaxConnIdleTime = cfg.db.maxIdleTime

	db, err := pgxpool.NewWithConfig(context.Background(), dbConfig)

	if err != nil {
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	err = db.Ping(ctx)
	if err != nil {
		return nil, err
	}

	// Return the pgxpool.Pool connection pool.
	return db, nil
}
