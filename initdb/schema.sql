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