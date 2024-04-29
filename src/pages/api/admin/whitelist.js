import { v4 as uuidv4 } from 'uuid';
import mysql from 'mysql2/promise';
import { dbConfig } from '/lib/config';
import { authOptions } from '../auth/[...nextauth]';
import { getServerSession } from 'next-auth';

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

	if (!session) {
		return res.status(401).send({ error: 'Unauthorized' });
	}

	if (req.method === 'GET') {
		const connection = await connectMySQL();

		if (session.user.email == process.env.ADMIN) {
			const [users] = await connection.execute('SELECT * FROM users');
			res.status(200).send(users);
		}
		res.status(401).send({ error: 'unauthorized' });
	} else {
		res.setHeader('Allow', ['POST', 'GET']);
		res.status(405).send({ error: `The ${req.method} method is not allowed` });
	}
}
