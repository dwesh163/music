-- Create table "users"
CREATE TABLE IF NOT EXISTS users (
    userId INT NOT NULL UNIQUE AUTO_INCREMENT,
    email VARCHAR(50) NOT NULL,
    username VARCHAR(50),
    image VARCHAR(255),
    provider VARCHAR(30) NOT NULL,
    name VARCHAR(150),
    password VARCHAR(255),
    createdAt DATETIME DEFAULT NOW(),
    updatedAt DATETIME,
    verified BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (userId)
);

-- Create table "playlists"
CREATE TABLE IF NOT EXISTS playlists (
    playlistId INT NOT NULL UNIQUE AUTO_INCREMENT,
    publicId VARCHAR(100),
    name VARCHAR(100) NOT NULL,
    user INT REFERENCES users(userId),
    PRIMARY KEY (playlistId)
);

-- Create table relation "playlist_tracks"
CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlistId INT REFERENCES playlists(playlistId),
    trackId varchar(50),
    date DATETIME NOT NULL,
    PRIMARY KEY (playlistId, trackId)
);
