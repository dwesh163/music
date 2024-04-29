-- Création de la table "users"
CREATE TABLE IF NOT EXISTS users (
    user_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    user_id_public VARCHAR(50) NOT NULL,
    user_email VARCHAR(50) NOT NULL,
    user_username VARCHAR(50) NOT NULL,
    user_image VARCHAR(255) NOT NULL,
    user_provider VARCHAR(30) NOT NULL,
    user_company VARCHAR(30) NOT NULL,
    user_name VARCHAR(150) NOT NULL,
    user_version VARCHAR(10) NOT NULL,
    PRIMARY KEY (user_id)
);

-- Création de la table "artists"
CREATE TABLE IF NOT EXISTS artists (
    artist_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    artist_name VARCHAR(100) NOT NULL,
    spotify_id VARCHAR(100) NOT NULL,
    public_id VARCHAR(100) NOT NULL,
    artist_type VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    bio TEXT,
    PRIMARY KEY (artist_id)
);

-- Création de la table "albums"
CREATE TABLE IF NOT EXISTS albums (
    album_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    album_name VARCHAR(100) NOT NULL,
    album_image VARCHAR(255) NOT NULL,
    album_type VARCHAR(100) NOT NULL,
    spotify_id VARCHAR(100) NOT NULL,
    public_id VARCHAR(100) NOT NULL,
    release_date DATE,
    total_tracks INT NOT NULL,
    PRIMARY KEY (album_id)
);

-- Création de la table "tracks"
CREATE TABLE IF NOT EXISTS tracks (
    track_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    duration INT,
    album_id INT REFERENCES albums(album_id),
    disc_number INT,
    track_number INT,
    popularity INT,
    spotify_id VARCHAR(100),
    track_public_id VARCHAR(100),
    release_date DATE,
    status INT DEFAULT 0,
    PRIMARY KEY (track_id)
);

-- Création de la table "playlists"
CREATE TABLE IF NOT EXISTS playlists (
    playlist_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    playlist_name VARCHAR(100) NOT NULL,
    public_id VARCHAR(100),
    playlist_user INT REFERENCES users(user_id),
    PRIMARY KEY (playlist_id)
);

-- Création de la table de relation "playlist_tracks"
CREATE TABLE IF NOT EXISTS playlist_tracks (
    playlist_id INT REFERENCES playlists(playlist_id),
    track_id INT REFERENCES tracks(track_id),
    added_date DATETIME NOT NULL,
    PRIMARY KEY (playlist_id, track_id)
);
-- Création de la table de relation "album_artist"
CREATE TABLE IF NOT EXISTS album_artist (
    album_id INT REFERENCES albums(album_id),
    artist_id INT REFERENCES artists(artist_id),
    PRIMARY KEY (album_id, artist_id)
);

-- Création de la table de relation "track_artist"
CREATE TABLE IF NOT EXISTS track_artist (
    track_id INT REFERENCES tracks(track_id),
    artist_id INT REFERENCES artists(artist_id),
    PRIMARY KEY (track_id, artist_id)
);

CREATE TABLE IF NOT EXISTS comments (
    comments_id INT NOT NULL UNIQUE AUTO_INCREMENT,
    Comments_title VARCHAR(255) NOT NULL,
    Comments_text TEXT NOT NULL,
    comments_public_id VARCHAR(100),
    comments_date DATETIME,
    Comments_user INT REFERENCES users(user_id),
    PRIMARY KEY (comments_id)
);

CREATE VIEW app_info AS
SELECT
    (SELECT COUNT(*) FROM artists) AS total_artists,
    (SELECT COUNT(*) FROM playlists) AS total_playlists,
    (SELECT AVG(playlist_count) FROM (SELECT COUNT(*) AS playlist_count FROM playlists GROUP BY playlist_user) AS sub) AS avg_playlists_per_user,
    (SELECT COUNT(*) FROM users) AS total_users,
    (SELECT COUNT(*) FROM tracks) AS total_tracks,
    (SELECT COUNT(*) FROM albums) AS total_albums,
    (SELECT COUNT(*) FROM comments) AS total_comments,
    (SELECT COUNT(DISTINCT artist_id) FROM album_artist) AS total_unique_album_artists,
    (SELECT COUNT(DISTINCT artist_id) FROM track_artist) AS total_unique_track_artists,
    (SELECT COUNT(*) FROM playlist_tracks) AS total_playlist_tracks,
    (SELECT COUNT(DISTINCT album_id) FROM album_artist) AS total_albums_with_artists,
    (SELECT COUNT(DISTINCT track_id) FROM track_artist) AS total_tracks_with_artists,
    (SELECT AVG(total_tracks) FROM (SELECT COUNT(*) AS total_tracks FROM albums GROUP BY release_date) AS avg_tracks_per_album) AS avg_tracks_per_album,
    (SELECT AVG(total_artists) FROM (SELECT COUNT(DISTINCT artist_id) AS total_artists FROM album_artist GROUP BY album_id) AS avg_artists_per_album),
    (SELECT AVG(total_tracks) FROM (SELECT COUNT(*) AS total_tracks FROM tracks GROUP BY release_date) AS avg_tracks_per_release_date),
    (SELECT AVG(total_artists) FROM (SELECT COUNT(DISTINCT artist_id) AS total_artists FROM track_artist GROUP BY track_id) AS avg_artists_per_track),
    (SELECT AVG(track_count) FROM (SELECT COUNT(*) AS track_count FROM playlist_tracks GROUP BY playlist_id) AS avg_tracks_per_playlist);
