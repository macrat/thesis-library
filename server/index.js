const path = require('path');

require('dotenv').config();

const express = require('express');
const app = express();

const database = require('./database');

const server = app.listen(process.env.PORT || 8080, () => {
	console.log('listening on :' + server.address().port);
});


app.use(require('morgan')('combined'));
app.use(require('body-parser').json({ limit: '100mb' }));

app.use(express.static(path.join(__dirname, '../build/')));

app.use(/^\/(|detail|search|upload|20[0-9][0-9]\/[^\/]+\/.+)$/, (req, res) => {
	res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.post('/api/post', (req, res) => {
	if (!req.body.pdf) {
		res.status(400).json({ error: 'missing pdf' });
		return;
	}

	let thesis = null;
	try {
		thesis = new database.Thesis(req.body);
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

	(new database.Database()).put(thesis)
		.then(x => res.status(200).json({}))
		.catch(err => {
			console.error(err);
			res.status(500).json({ error: 'something wrong' });
		})
});

app.get(/^\/api\/thesis\/(20[0-9][0-9])\/([^\/]+)\/(.+)\/metadata$/, (req, res) => {
	const db = new database.Database;
	db.get(Number(req.params[0]), decodeURIComponent(req.params[1]), decodeURIComponent(req.params[2]))
		.then(thesis => res.status(200).json(thesis.asSendableJSON()))
		.catch(err => {
			console.error(err);
		})
});

app.get('/api/thesis/', (req, res) => {
	(new database.Database()).getOverviewIndex()
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
	(new database.Database()).getOverviewIndex()
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
	(new database.Database()).getOverviewIndex()
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
	(new database.Database()).getOverviewIndex()
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
	(new database.Database()).getTextIndex()
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
