const path = require('path');

require('dotenv').config();

const express = require('express');
const app = express();

const Database = require('./database');
const Thesis = require('./thesis');
const makePassword = require('./utils').makePassword;


const server = app.listen(process.env.PORT || 8080, () => {
	console.log('listening on :' + server.address().port);
});


app.use(require('morgan')('combined'));
app.use(require('body-parser').json({ limit: '100mb' }));


app.use((req, res, next) => {
	if (req.headers['x-forwarded-proto'] && req.headers['x-forwarded-proto'] !== 'https') {
		res.redirect('https://' + req.headers.host + req.url);
	} else {
		next();
	}
});


if (process.env.CONTENTS_SERVER_ORIGIN) {
	app.user((req, res, next) => {
		res.set('Access-Control-Allow-Origin', process.env.CONTENTS_SERVER_ORIGIN);
		res.set('Access-Control-Allow-Methods', 'GET,POST,PATCH,HEAD,OPTIONS');
		res.set('Access-Control-Expose-Headers', 'Thesis-Library-Metadata');
		res.set('Access-Control-Max-Age', 7*24*60*60);
		next();
	});
}


app.use(express.static(path.join(__dirname, '../build/')));


app.post('/api/post', (req, res) => {
	if (!req.body.pdf) {
		res.status(400).json({ error: 'missing pdf' });
		return;
	}

	const password = makePassword();

	let thesis = null;
	try {
		thesis = new Thesis({
			year: req.body.year,
			degree: req.body.degree,
			author: req.body.author,
			title: req.body.title,
			overview: req.body.overview,
			memo: req.body.memo,
			pdf: req.body.pdf,
			rawPassword: password,
		});
	} catch(e) {
		if (typeof e === 'string' && e.startsWith && (e.startsWith('missing ') || e.startsWith('invalid '))) {
			res.status(400).json({ error: e });
		} else {
			console.error(e);
			res.status(400).json({ error: 'something wrong' });
		}
		return;
	}

	(new Database()).put(thesis)
		.then(x => res.status(200).json({ password: password }))
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get(/^\/api\/thesis\/(20[0-9][0-9])\/([^\/]+)\/([^\/]+)$/, (req, res) => {
	const db = new Database();
	db.get(Number(req.params[0]), decodeURIComponent(req.params[1]), decodeURIComponent(req.params[2]))
		.then(thesis => {
			db.getPDF(thesis).then(pdf => {
				res.set('Thesis-Library-Metadata', new Buffer(JSON.stringify(thesis.asSendableJSON())).toString('base64'));
				res.set('Content-Type', 'application/pdf');
				res.status(200).send(pdf);
			});
		})
		.catch(err => {
			if (err.code === 404) {
				res.status(404).json({ error: 'not found' });
			} else {
				console.error(err);
				res.status(500).json({ error: 'something wrong' });
			}
		})
});


app.post(/^\/api\/thesis\/(20[0-9][0-9])\/([^\/]+)\/([^\/]+)\/check-password$/, (req, res) => {
	if (!req.body.password) {
		res.status(400).json({ error: 'missing password' });
		return;
	}
	if (typeof req.body.password !== 'string') {
		res.status(400).json({ error: 'invalid password' });
	}

	const db = new Database();
	db.get(Number(req.params[0]), decodeURIComponent(req.params[1]), decodeURIComponent(req.params[2]))
		.then(thesis => {
			if (thesis.checkPassword(req.body.password)) {
				res.status(200).json({ result: 'correct' });
			} else {
				res.status(200).json({ result: 'incorrect' });
			}
		})
		.catch(err => {
			if (err.code === 404) {
				res.status(404).json({ error: 'not found' });
			} else {
				console.error(err);
				res.status(500).json({ error: 'something wrong' });
			}
		})
});


app.delete(/^\/api\/thesis\/(20[0-9][0-9])\/([^\/]+)\/([^\/]+)$/, (req, res) => {
	if (!req.body.password) {
		res.status(400).json({ error: 'missing password' });
		return;
	}
	if (typeof req.body.password !== 'string') {
		res.status(400).json({ error: 'invalid password' });
	}

	const db = new Database();
	db.get(Number(req.params[0]), decodeURIComponent(req.params[1]), decodeURIComponent(req.params[2]))
		.then(thesis => {
			if (!thesis.checkPassword(req.body.password)) {
				res.status(403).json({ result: 'incorrect password' });
			}

			return db.remove(thesis);
		})
		.then(() => {
			res.status(201).json({});
		})
		.catch(err => {
			if (err.code === 404) {
				res.status(404).json({ error: 'not found' });
			} else {
				console.error(err);
				res.status(500).json({ error: 'something wrong' });
			}
		})
});


app.patch(/^\/api\/thesis\/(20[0-9][0-9])\/([^\/]+)\/([^\/]+)$/, (req, res) => {
	if (!req.body.password) {
		res.status(400).json({ error: 'missing password' });
		return;
	}
	if (typeof req.body.password !== 'string') {
		res.status(400).json({ error: 'invalid password' });
	}

	const db = new Database();
	db.get(Number(req.params[0]), decodeURIComponent(req.params[1]), decodeURIComponent(req.params[2]))
		.catch(err => {
			if (err.code === 404) {
				res.status(404).json({ error: 'not found' });
				return Promise.reject(null);
			} else {
				return Promise.reject(err);
			}
		})
		.then(thesis => {
			if (!thesis.checkPassword(req.body.password)) {
				res.status(403).json({ result: 'incorrect password' });
			}

			let newThesis = null;
			try {
				newThesis = new Thesis({
					year: Number(req.body.year) || thesis.year,
					degree: req.body.degree || thesis.degree,
					author: req.body.author || thesis.author,
					title: req.body.title || thesis.title,
					overview: req.body.overview || thesis.overview,
					memo: req.body.memo || thesis.memo,
					pdf: req.body.pdf || undefined,
					rawPassword: req.body.password,
				});
			} catch(e) {
				return Promise.reject(e);
			}

			if (req.body.pdf) {
				return db.update(thesis, newThesis);
			} else {
				return db.updateMetadata(thesis, newThesis);
			}
		})
		.then(() => {
			res.status(201).json({});
		})
		.catch(err => {
			if (!err) {
			} else if (typeof err === 'string' && err.startsWith && (err.startsWith('missing ') || err.startsWith('invalid '))) {
				res.status(400).json({ error: err });
			} else {
				console.error(err);
				res.status(500).json({ error: 'something wrong' });
			}
		})
});


app.get('/api/thesis/', (req, res) => {
	(new Database()).getOverviewIndex()
		.then(index => {
			const result = index.asArray().map(x => x.year).filter((x, i, xs) => xs.indexOf(x) === i);
			res.status(200).json(result);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get(/^\/api\/thesis\/(20[0-9][0-9])\//, (req, res) => {
	(new Database()).getOverviewIndex()
		.then(index => {
			const result = index.asArray().filter(x => x.year === Number(req.params[0])).map(x => ({
				year: x.year,
				author: x.author,
				title: x.title,
			}))
			res.status(200).json(result);
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get('/api/index/overview', (req, res) => {
	(new Database()).getOverviewIndex()
		.then(index => {
			res.status(200).json(index.asArray());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get('/api/index/text', (req, res) => {
	(new Database()).getTextIndex()
		.then(index => {
			res.status(200).json(index.asArray());
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get(/.*/, (req, res) => {
	res.sendFile(path.join(__dirname, '../build/index.html'));
});
