CREATE TABLE answersUpvotes (
  answerId BIGINT REFERENCES answers(_id) ON DELETE CASCADE NOT NULL,
  userId BIGINT REFERENCES users(_id) ON DELETE CASCADE NOT NULL,
  UNIQUE (answerId, userId)
);