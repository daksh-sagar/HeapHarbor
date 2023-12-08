CREATE TABLE questionsDownvotes (
  questionId INT REFERENCES questions(_id) ON DELETE CASCADE NOT NULL,
  userId INT REFERENCES users(_id) ON DELETE CASCADE NOT NULL,
  UNIQUE (questionId, userId)
);