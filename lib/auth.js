import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function UserAccess(session, service) {
	if (session == null) {
		return false;
	}

	let access;

	if (service == 'admin') {
		access = ['admin'];
	} else if (service == 'player') {
		access = ['admin', 'premium'];
	} else {
	}

	try {
		const connection = await connectMySQL();

		const [[user]] = await connection.execute('SELECT * FROM users LEFT JOIN authorization a on users.authorization_id = a.authorization_id WHERE user_email = ?;', [session.user.email]);
		return access.includes(user.authorization_name);
	} catch (error) {
		return false;
	}
}
