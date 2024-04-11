CREATE TABLE IF NOT EXISTS users (
	user_id INT NOT NULL UNIQUE AUTO_INCREMENT,
	user_id_public varchar(50) NOT NULL,
	user_email varchar(50) NOT NULL,
	user_username varchar(50) NOT NULL,
	user_image varchar(255) NOT NULL,
	user_provider varchar(30) NOT NULL,
	user_company varchar(30) NOT NULL,
	user_name varchar(150) NOT NULL,
	PRIMARY KEY (user_id)
);

