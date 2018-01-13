const zlib = require('zlib');

const Storage = require('@google-cloud/storage');
const storage = Storage({ projectId: process.env.GCLOUD_PROJECT });
const bucket = storage.bucket(process.env.GCLOUD_BUCKET);

const pdf = require('./pdf');


function makeKey(year, author, title) {
	return `${year}/${author}/${title}`;
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
		this._rawPDF = obj.rawPDF;

		if (!this._rawPDF && typeof obj.pdf === 'string') {
			this._rawPDF = new Buffer(obj.pdf, 'base64');
		}

		if (!this.year) throw 'missing year';
		if (!this.degree) throw 'missing degree';
		if (!this.author) throw 'missing author';
		if (!this.title) throw 'missing title';
		if (!this.overview) throw 'missing overview';

		if (this.degree !== 'bachelor' && this.degree !== 'master' && this.degree !== 'doctor') {
			throw 'invalid degree';
		}
	}

	get key() {
		return makeKey(this.year, this.author, this.title);
	}

	getPDF() {
		if (this._rawPDF) {
			return Promise.resolve(this._rawPDF);
		} else {
			return bucket.file(this.key).download().then(data => {
				this._rawPDF = data[0];
				return this._rawPDF;
			});
		}
	}

	getText() {
		return this.getPDF().then(pdf.toText);
	}

	asSendableJSON() {
		return {
			year: this.year,
			degree: this.degree,
			author: this.author,
			title: this.title,
			overview: this.overview,
			memo: this.memo,
			pdf: `https://storage.googleapis.com/${process.env.GCLOUD_BUCKET}/${this.year}/${encodeURIComponent(this.author)}/${encodeURIComponent(this.title)}`,
		};
	}
}


class Index {
	constructor(obj) {
		this.data = {};
		for (let x in (obj || [])) {
			this.data[makeKey(x.year, x.author, x.title)] = obj;
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

	asJSON() {
		return JSON.stringify(this.asArray());
	}
}


class Database {
	get(year, author, title) {
		return bucket.file(makeKey(year, author, title)).getMetadata().then(data => {
			return new Thesis(data[1].metadata);
		});
	}

	put(thesis) {
		return thesis.getText().then(thesisText => {
			return new Promise((resolve, reject) => {
				console.log('upload file');

				if (!thesis._rawPDF) {
					reject("this thesis hasn't pdf");
					return;
				}

				const file = bucket.file(thesis.key);

				const stream = file.createWriteStream({
					metadata: {
						contentType: "application/pdf",
						cacheControl: 24 * 60 * 60,
						metadata: {
							year: thesis.year,
							degree: thesis.degree,
							author: thesis.author,
							title: thesis.title,
							overview: thesis.overview,
							memo: thesis.memo,
						},
					},
				});

				stream.on('finish', x => resolve(file.makePublic()));
				stream.on('error', reject);

				stream.end(thesis._rawPDF);
			})
			.then(() => console.log('get overview'))
			.then(() => this.getOverviewIndex())
			.then(overview => {
				overview.append(thesis, thesis.overview);
				console.log('upload overview');

				return this._putIndex('index/overview', overview);
			})
			.then(() => console.log('get text'))
			.then(() => this.getTextIndex())
			.then(text => {
				text.append(thesis, thesisText);
				console.log('upload text');

				return this._putIndex('index/text', text);
			})
			.then(() => null);
		});
	}

	_putIndex(key, index) {
		return new Promise((resolve, reject) => {
			zlib.gzip(index.asJSON(), {level:9}, (err, binary) => {
				if (err) {
					reject(err);
				} else {
					const file = bucket.file(key);

					const stream = file.createWriteStream({
						metadata: {
							contentType: "application/json",
							contentEncoding: 'gzip',
							cacheControl: 24 * 60 * 60,
						},
					});

					stream.on('finish', x => resolve(file.makePublic()));
					stream.on('error', reject);

					stream.end(binary);
				}
			});
		});
	}

	_getIndex(key) {
		return bucket.file(key).download()
			.catch(err => '[]')
			.then(x => new Index(JSON.parse(x[0])));
	}

	getOverviewIndex() {
		return this._getIndex('index/overview');
	}

	getTextIndex() {
		return this._getIndex('index/text');
	}
};


module.exports = {
	Database: Database,
	Thesis: Thesis,
}
