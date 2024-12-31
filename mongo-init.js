db = db.getSiblingDB(process.env.MONGO_INITDB_DATABASE);

db.createCollection('users');

db.createUser({
	user: process.env.MONGO_INITDB_USER_USERNAME,
	pwd: process.env.MONGO_INITDB_USER_PASSWORD,
	roles: [{ role: 'readWrite', db: process.env.MONGO_INITDB_DATABASE }],
});
