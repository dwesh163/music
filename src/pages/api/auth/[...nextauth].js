import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		console.error('Error connecting to MySQL:', error);
		throw error;
	}
}

export const authOptions = (req) => ({
	providers: [
		GithubProvider({
			clientId: process.env.GITHUB_ID,
			clientSecret: process.env.GITHUB_SECRET,
		}),
	],
	callbacks: {
		async signIn({ user, account, profile, email, credentials }) {
			const connection = await connectMySQL();
			try {
				const [[existingUser]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [user.email]);

				if (existingUser) {
					await connection.execute('UPDATE users SET user_username = ?, user_image = ?, user_provider = ?, user_company = ?, user_name = ? WHERE user_email = ?', [profile.login, user.image, account.provider, profile.company, profile.name, user.email]);
				} else {
					await connection.execute('INSERT INTO users (user_id_public, user_email, user_username, user_image, user_provider, user_company, user_name) VALUES (?, ?, ?, ?, ?, ?, ?)', [uuidv4(), user.email, profile.login, user.image, account.provider, profile.company, profile.name]);
					const [[insertedUser]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [user.email]);
					await connection.execute('INSERT INTO playlists (playlist_name, public_id, playlist_user) VALUES (?, ?, ?)', ['Liked', uuidv4(), insertedUser.user_id]);
				}

				if (user.email == process.env.SUPER_ADMIN) {
					return Promise.resolve(true);
				}

				return Promise.resolve(false);
			} catch (error) {
				console.error('Error during sign-in:', error);
				return Promise.resolve(false);
			} finally {
				if (connection) connection.end();
			}
		},

		async session({ session, token, user }) {
			const connection = await connectMySQL();

			try {
				const [[existingUser]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);
				if (existingUser) {
					session.user.id = existingUser.user_id_public;
					session.user.username = existingUser.user_username;
				}
			} catch (error) {
				console.error('Error during session creation:', error);
			} finally {
				if (connection) connection.end();
			}
			return session;
		},
	},
});

export default (req, res) => NextAuth(req, res, authOptions(req));
