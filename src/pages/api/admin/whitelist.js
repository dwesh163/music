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

		const [users] = await connection.execute('SELECT * FROM users LEFT JOIN authorization a on a.authorization_id = users.authorization_id;');
		users.forEach((user) => {
			if (user.user_email === process.env.ADMIN) {
				user.isAdmin = true;
			} else {
				user.isAdmin = false;
			}
		});
		res.status(200).send(users);
	} else if (req.method == 'POST') {
		const connection = await connectMySQL();
		const { userId, authorizationName } = req.body;
		const [[users]] = await connection.execute('SELECT * FROM users WHERE user_id_public = ?;', [userId]);

		if (process.env.ADMIN != users.user_email) {
			await connection.execute('UPDATE users SET authorization_id = (SELECT authorization_id FROM authorization WHERE authorization_name = ?) WHERE user_id_public = ?;', [authorizationName, userId]);
			res.status(200).send({ status: 'ok' });
		}
		res.status(401).send({ error: 'unauthorized' });
	} else {
		res.setHeader('Allow', ['POST', 'GET']);
		res.status(405).send({ error: `The ${req.method} method is not allowed` });
	}
}
