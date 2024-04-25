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

export default async function Comments(req, res) {
	const session = await getServerSession(req, res, authOptions);

	if (!session) {
		return res.status(401).send({ error: 'Unauthorized' });
	}

	if (req.method === 'POST') {
		const { comment, title } = req.body;
		const connection = await connectMySQL();
		const id = uuidv4();
		try {
			const [[user]] = await connection.execute('SELECT * FROM users WHERE user_email = ?', [session.user.email]);

			if (comment == '') {
				res.status(200).send({ error: 'The comment must not be blank' });
			}

			await connection.execute('INSERT INTO comments (Comments_title, Comments_text, comments_date, comments_public_id, Comments_user) VALUES (?, ?, ?, ?, ?)', [title ? title : '', comment, new Date(), id, user.user_id]);

			res.status(200).send({ status: 'ok' });
		} catch (error) {
			console.log(error);
			res.status(500).send({ error: 'Internal Server Error' });
		}
	} else if (req.method === 'GET') {
		const connection = await connectMySQL();

		// if (session.user.email == process.env.ADMIN) {
		const [[info]] = await connection.execute('SELECT * FROM app_info');
		res.status(200).send(info);
		// }
		res.status(401).send({ error: 'unauthorized' });
	} else {
		res.setHeader('Allow', ['POST', 'GET']);
		res.status(405).send({ error: `The ${req.method} method is not allowed` });
	}
}
