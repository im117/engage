use engage;

CREATE TABLE users(
    id INT AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY(id)
);
CREATE TABLE videos(
    id int AUTO_INCREMENT,
    creator_id int NOT NULL, 
    title text NOT NULL,
    description text NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fileName text NOT NULL,
    PRIMARY KEY(id),
    FOREIGN KEY (creator_id) REFERENCES users(id)
);