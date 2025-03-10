use engage;


CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
	username VARCHAR(30)  UNIQUE,
    email VARCHAR(50) UNIQUE,
    password VARCHAR(250),
    role VARCHAR(10),
    dateCreated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE videos(
    id int AUTO_INCREMENT,
    creator_id int NOT NULL, -- NOT NULL REMOVED FOR TESTING
    title text NOT NULL,
    description text,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fileName text NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);

CREATE TABLE comments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id int NOT NULL,
    content text NOT NULL,
    likes int
);

CREATE TABLE replies (
    id INT PRIMARY KEY AUTO_INCREMENT,
    creator_id int NOT NULL,
    content text NOT NULL,
    likes int,
    comment_id int NOT NULL FOREIGN KEY
);

CREATE TABLE reply_likes(
    id INT PRIMARY KEY AUTO_INCREMENT,
    reply_id INT NOT NULL FOREIGN KEY
);