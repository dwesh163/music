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

export default async function WriteLogs(method, url, user, action, relatedData) {
	const connection = await connectMySQL();

	connection.execute('INSERT INTO logs (method, url, action, related_data, date, user_id) VALUES (?, ?, ?, ?, ?,(SELECT user_id FROM users WHERE user_email = ?))', [method, url, action, relatedData, new Date(), user]);

	return;
}
