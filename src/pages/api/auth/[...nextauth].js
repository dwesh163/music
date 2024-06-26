import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';

import NextAuth from 'next-auth';
import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';

import packageJson from '/package.json';
import UserAccess from '../../../../lib/auth';
import WriteLogs from '../../../../lib/logs';

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
		GoogleProvider({
			clientId: process.env.GOOGLE_ID,
			clientSecret: process.env.GOOGLE_SECRET,
		}),
	],
	pages: {
		signIn: '/auth/signin',
		error: '/error',
	},
	callbacks: {
		async signIn({ user, account, profile, email, credentials }) {
			const connection = await connectMySQL();
			try {
				const [[existingUser]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [user.email]);

				if (existingUser) {
					await connection.execute('UPDATE users SET user_username = ?, user_image = ?, user_provider = ?, user_company = ?, user_name = ?, user_version = ? WHERE user_email = ?', [profile.login ? profile.login : '', user.image ? user.image : '', account.provider, profile.company ? profile.company : '', profile.name ? profile.name : '', packageJson.version, user.email]);
				} else {
					await connection.execute('INSERT INTO users (user_id_public, user_email, user_username, user_image, user_provider, user_company, user_name, user_version) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [uuidv4(), user.email, profile.login ? profile.login : '', user.image ? user.image : '', account.provider ? account.provider : '', profile.company ? profile.company : '', profile.name ? profile.name : '', packageJson.version]);
					const [[insertedUser]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [user.email]);
					await connection.execute('INSERT INTO playlists (playlist_name, public_id, playlist_user) VALUES (?, ?, ?)', ['Liked', uuidv4(), insertedUser.user_id]);
					await connection.execute('INSERT INTO user_authorization (user_id, authorization_id) VALUES (?, ?)', [insertedUser.user_id, 1]);
				}

				const session = { user };
				WriteLogs(req.method, req.url, session.user.email, 'signin', 'signin');
				if (await UserAccess(session, 'player')) {
					return Promise.resolve(true);
				}

				return Promise.resolve(true);
			} catch (error) {
				console.error('Error during sign-in:', error);
				return Promise.resolve(false);
			} finally {
				if (connection) connection.end();
			}
		},

		async session({ session, token, user }) {
			const connection = await connectMySQL();

			// WriteLogs(req.method, req.url, session.user.email, 'session', 'session');
			try {
				const [[existingUser]] = await connection.execute('SELECT * FROM users LEFT JOIN authorization a on a.authorization_id = users.authorization_id WHERE user_email = ?', [session.user.email]);
				if (existingUser) {
					await connection.execute('UPDATE users SET last_connect = ? WHERE user_email = ?', [new Date(), session.user.email]);

					session.user.id = existingUser.user_id_public;
					session.user.username = existingUser.user_username;
					session.user.version = existingUser.user_version;
					session.user.access = existingUser.authorization_id == 4 || existingUser.authorization_id == 3;
					session.user.accessName = existingUser.authorization_name;
					session.user.error = existingUser.denied;
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
