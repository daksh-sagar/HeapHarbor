CREATE TABLE questionsTags (
  questionId BIGINT REFERENCES questions(_id) ON DELETE CASCADE NOT NULL,
  tagId BIGINT REFERENCES tags(_id) ON DELETE CASCADE NOT NULL,
  UNIQUE (questionId, tagId)
);
