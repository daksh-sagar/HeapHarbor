CREATE TABLE IF NOT EXISTS users (
 _id BIGSERIAL PRIMARY KEY,
  clerkId TEXT UNIQUE,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  bio TEXT,
  picture TEXT,
  location TEXT,
  portfolioWebsite TEXT,
  reputation INT DEFAULT 0,
  joinedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);