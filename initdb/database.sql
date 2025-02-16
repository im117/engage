-- CREATE database engage;
USE engage;
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
	username VARCHAR(20)  UNIQUE,
    email VARCHAR(50) UNIQUE,
    password VARBINARY(500),
    role VARCHAR(15),
    date VARCHAR(8)
)