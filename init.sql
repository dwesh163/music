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

-- Création de la table "genres"
CREATE TABLE IF NOT EXISTS genres (
                                      genre_id INT NOT NULL UNIQUE AUTO_INCREMENT,
                                      genre_name VARCHAR(50) NOT NULL,
                                      PRIMARY KEY (genre_id)
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
                                      PRIMARY KEY (track_id)
);

-- Création de la table "playlists"
CREATE TABLE IF NOT EXISTS playlists (
                                         playlist_id INT NOT NULL UNIQUE AUTO_INCREMENT,
                                         playlist_name VARCHAR(100) NOT NULL UNIQUE,
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
