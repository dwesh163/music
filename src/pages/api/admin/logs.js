import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';
import UserAccess from '../../../../lib/auth';

async function connectMySQL() {
	try {
		const connection = await mysql.createConnection(dbConfig);
		return connection;
	} catch (error) {
		throw error;
	}
}

export default async function Whitelist(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!(await UserAccess(session, 'admin'))) {
		return res.status(401).send({ error: 'Unauthorized' });
	}

	if (req.method === 'GET') {
		const connection = await connectMySQL();

		const [users] = await connection.execute('SELECT method, url, action, related_data, date FROM logs LEFT JOIN music.users u on u.user_id = logs.user_id ORDER BY date DESC LIMIT 100;');
		users.forEach((user) => {
			if (user.user_email === process.env.ADMIN) {
				user.isAdmin = true;
			} else {
				user.isAdmin = false;
			}
		});
		res.status(200).send(users);
	} else {
		res.setHeader('Allow', ['POST', 'GET']);
		res.status(405).send({ error: `The ${req.method} method is not allowed` });
	}
}
