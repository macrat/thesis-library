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

app.use(express.static(path.join(__dirname, '../build/')));


app.post('/api/post', (req, res) => {
	if (!req.body.pdf) {
		res.status(400).json({ error: 'missing pdf' });
		return;
	}

	if (!req.body.password) {
		req.body.password = makePassword();
	}

	let thesis = null;
	try {
		thesis = new Thesis({
			year: req.body.year,
			degree: req.body.degree,
			author: req.body.author,
			title: req.body.title,
			overview: req.body.overview,
			memo: req.body.memon,
			pdf: req.body.pdf,
			rawPassword: req.body.password,
		});
	} catch(e) {
		if (e.startsWith && e.startsWith('missing ')) {
			res.status(400).json({ error: e });
		} else if (e === 'invalid degree') {
			res.status(400).json({ error: e });
		} else {
			console.error(e);
			res.status(400).json({ error: 'something wrong' });
		}
		return;
	}

	(new Database()).put(thesis)
		.then(x => res.status(200).json({ password: req.body.password }))
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get(/^\/api\/thesis\/(20[0-9][0-9])\/([^\/]+)\/(.+)\/metadata$/, (req, res) => {
	const db = new Database();
	db.get(Number(req.params[0]), decodeURIComponent(req.params[1]), decodeURIComponent(req.params[2]))
		.then(thesis => res.status(200).json(thesis.asSendableJSON()))
		.catch(err => {
			if (err.code === 404) {
				res.status(404).json({ error: 'not found' });
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

app.get(/^\/api\/thesis\/(20[0-9][0-9])\/([^\/]+)\./, (req, res) => {
	(new Database()).getOverviewIndex()
		.then(index => {
			const result = index.asArray().filter(x => x.year === Number(req.params[0]) && x.author === req.params[1]).map(x => ({
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
			res.status(200).json(index.asArray().map(x => ({
				year: x.year,
				author: x.author,
				title: x.title,
				degree: x.degree,
				overview: x.content,
			})));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get('/api/index/text', (req, res) => {
	(new Database()).getTextIndex()
		.then(index => {
			res.status(200).json(index.asArray().map(x => ({
				year: x.year,
				author: x.author,
				title: x.title,
				degree: x.degree,
				text: x.content,
			})));
		})
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});


app.get(/.*/, (req, res) => {
	res.sendFile(path.join(__dirname, '../build/index.html'));
});
