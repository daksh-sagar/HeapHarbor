CREATE TABLE questionsUpvotes (
  questionId BIGINT REFERENCES questions(_id) ON DELETE CASCADE NOT NULL,
  userId BIGINT REFERENCES users(_id) ON DELETE CASCADE NOT NULL,
  UNIQUE (questionId, userId)
);