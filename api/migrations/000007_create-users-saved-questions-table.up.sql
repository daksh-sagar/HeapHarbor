CREATE TABLE usersSavedQuestions (
  userId BIGINT REFERENCES users(_id) ON DELETE CASCADE NOT NULL,
  questionId BIGINT REFERENCES questions(_id) ON DELETE CASCADE NOT NULL,
  UNIQUE (userId, questionId)
);
