const bcrypt = require('bcrypt');

const handleRegister = (req, res, db) => {
	const { email, name, password } = req.body;
	const hash = bcrypt.hashSync(password, 10);
	db.transaction(trx => {
		trx
			.insert({ hash, email })
			.into('login')
			.returning('email')
			.then(loginEmail => {
				return trx('users')
					.returning('*')
					.insert({
						email: loginEmail[0],
						name,
						joined: new Date()
					})
					.then(response => {
						res.json(response[0]);
					});
			})
			.then(trx.commit)
			.catch(trx.rollback);
	}).catch(err => {
		res.status(400).json('Unable to register', err);
	});
};

module.exports = { handleRegister };
