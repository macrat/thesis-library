const Datastore = require('@google-cloud/datastore');
const datastore = Datastore();

const pdf = require('./pdf');


function makeKey(year, author, title) {
	return datastore.key([
		'thesis',
		`${year}/${author}/${title}`,
	]);
}


class Thesis {
	constructor(obj) {
		if (!obj) throw 'obj was undefined';

		this.year = obj.year;
		this.degree = obj.degree;
		this.author = obj.author;
		this.title = obj.title;
		this.overview = obj.overview;
		this.memo = obj.memo || '';
		this.pdf = obj.pdf;

		if (!this.pdf && obj.rawPDF && typeof obj.rawPDF.toString === 'function') {
			this.pdf = obj.rawPDF.toString();
		}

		if (!this.year) throw 'missing year';
		if (!this.degree) throw 'missing degree';
		if (!this.author) throw 'missing author';
		if (!this.title) throw 'missing title';
		if (!this.overview) throw 'missing overview';
		if (!this.pdf) throw 'missing pdf or rawPDF';
	}

	get key() {
		return makeKey(this.year, this.author, this.title);
	}

	get rawPDF() {
		return new Buffer(this.pdf, 'base64');
	}

	asTask() {
		return {
			key: this.key,
			data: {
				year: this.year,
				degree: this.degree,
				author: this.author,
				title: this.title,
				overview: this.overview,
				memo: this.memo,
				pdf: this.pdf,
			},
		};
	}

	getText() {
		return pdf.toText(this.rawPDF);
	}
}


class Index {
	constructor(obj) {
		const data = obj ? (obj.data || []) : [];
		this.data = {};
		for (let x in data) {
			this.data[makeKey(x.year, x.author, x.title)] = data[x];
		}
	}

	append(thesis, content) {
		this.data[makeKey(thesis.year, thesis.author, thesis.title)] = {
			year: thesis.year,
			author: thesis.author,
			title: thesis.title,
			content: content,
		};
	}

	asArray() {
		const result = [];
		for (let key in this.data) {
			result.push(this.data[key]);
		}
		return result;
	}

	asObject() {
		return {
			data: this.asArray(),
		};
	}
}


class Database {
	get(year, author, title) {
		return datastore.get(makeKey(year, author, title)).then(xs => new Thesis(xs[0]));
	}

	put(thesis) {
		const transaction = datastore.transaction();

		return thesis.getText().then(thesisText => {
			return transaction.run()
				.then(() => transaction.get([
					datastore.key(['index', 'overview']),
					datastore.key(['index', 'text']),
				]))
				.then(results => {
					const overview = new Index(results[0][0]);
					const text = new Index(results[0][1]);

					overview.append(thesis, thesis.overview);
					text.append(thesis, thesisText);

					return transaction.save([
						{
							key: datastore.key(['index', 'overview']),
							data: overview.asObject(),
						},
						{
							key: datastore.key(['index', 'text']),
							data: text.asObject(),
						},
						thesis.asTask(),
					]);
				})
				.then(() => {
					return transaction.commit();
				})
				.catch(err => {
					transaction.rollback();
					return Promise.reject(err);
				});
		});
	}

	getOverviewIndex() {
		return datastore.get(datastore.key(['index', 'overview'])).then(results => new Index(results[0]));
	}

	getTextIndex() {
		return datastore.get(datastore.key(['index', 'text'])).then(results => new Index(results[0]));
	}
};

module.exports = {
	Database: Database,
	Thesis: Thesis,
}
