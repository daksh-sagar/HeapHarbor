**1. Users:**

| Column Name | Data Type | Description |
|---|---|---|
| _id | int64 | Primary key, unique identifier for the user. |
| clerkId | string | Clerk ID of the user. |
| name | string | User's name. |
| username | string | Unique username for the user. |
| email | string | Unique email address for the user. |
| bio | string | User's bio. |
| picture | string | URL for the user's picture. |
| location | string | User's location. |
| website | string | User's website. |
| reputation | int | User's reputation score. |
| joinDate | time.Time | Timestamp of the user's join date. |

**2. Questions:**

| Column Name | Data Type | Description |
|---|---|---|
| _id | int64 | Primary key, unique identifier for the question. |
| title | string | Title of the question. |
| content | string | Content of the question. |
| authorId | int64 | Foreign key referencing the user who created the question. |
| views | int | Number of times the question has been viewed. |
| createdAt | time.Time | Timestamp of the question creation. |

**3. Answers:**

| Column Name | Data Type | Description |
|---|---|---|
| _id | int64 | Primary key, unique identifier for the answer. |
| authorId | int64 | Foreign key referencing the user who created the answer. |
| questionId | int64 | Foreign key referencing the question the answer is related to. |
| content | string | Content of the answer. |
| createdAt | time.Time | Timestamp of the answer creation. |

**4. Tags:**

| Column Name | Data Type | Description |
|---|---|---|
| _id | int64 | Primary key, unique identifier for the tag. |
| name | string | Unique name of the tag. |
| description | string | Description of the tag. |
| createdAt | time.Time | Timestamp of the tag creation. |

**5. User_Saved_Questions:**

| Column Name | Data Type | Description |
|---|---|---|
| user_id | int64 | Foreign key referencing the user who saved the question. |
| question_id | int64 | Foreign key referencing the saved question. |

**6. Question_Upvotes:**

| Column Name | Data Type | Description |
|---|---|---|
| question_id | int64 | Foreign key referencing the upvoted question. |
| user_id | int64 | Foreign key referencing the user who upvoted the question. |

**7. Question_Downvotes:**

| Column Name | Data Type | Description |
|---|---|---|
| question_id | int64 | Foreign key referencing the downvoted question. |
| user_id | int64 | Foreign key referencing the user who downvoted the question. |

**8. Answer_Upvotes:**

| Column Name | Data Type | Description |
|---|---|---|
| answer_id | int64 | Foreign key referencing the upvoted answer. |
| user_id | int64 | Foreign key referencing the user who upvoted the answer. |

**9. Answer_Downvotes:**

| Column Name | Data Type | Description |
|---|---|---|
| answer_id | int64 | Foreign key referencing the downvoted answer. |
| user_id | int64 | Foreign key referencing the user who downvoted the answer. |

**10. User_Followings:**

| Column Name | Data Type | Description |
|---|---|---|
| follower_id | int64 | Foreign key referencing the user who follows the tag. |
| tag_id | int64 | Foreign key referencing the followed tag. |

**10. Question_Tags:**

| Column Name | Data Type | Description |
|---|---|---|
| question_id | int64 | Foreign key referencing the question which has this tag. |
| tag_id | int64 | Foreign key referencing the followed tag. |

**Relationships:**

* A user can have many questions.
* A user can have many answers.
* A question can have many answers.
* A question can have many tags.
* A tag can have many questions.
* A user can follow many tags.
* A user can save many questions.
* A question can be saved by many users
* A question can have many upvotes and downvotes.
* An answer can have many upvotes and downvotes.