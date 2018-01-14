const zlib = require('zlib');

const Storage = require('@google-cloud/storage');

const Thesis = require('./thesis');


function makeKey(year, author, title) {
	if (!year || !author || !title) {
		throw 'missing argument';
	}
	return `${year}/${author}/${title}`;
}


function makeKeyFor(thesis) {
	return makeKeyFor(thesis.year, thesis.author, thesis.title);
}


class Index {
	constructor(obj) {
		this.data = {};
		(obj || []).forEach(x => {
			this.data[makeKey(x.year, x.author, x.title)] = x;
		});
	}

	append(thesis, content) {
		this.data[makeKey(thesis.year, thesis.author, thesis.title)] = {
			year: thesis.year,
			author: thesis.author,
			title: thesis.title,
			degree: thesis.degree,
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
	constructor() {
		this.storage = Storage({ projectId: process.env.GCLOUD_PROJECT });
		this.bucket = this.storage.bucket(process.env.GCLOUD_BUCKET);
	}

	get(year, author, title) {
		return this.bucket.file(makeKey(year, author, title)).getMetadata().then(data => {
			return new Thesis(data[1].metadata);
		});
	}

	put(thesis) {
		return thesis.getText().then(thesisText => {
			return new Promise((resolve, reject) => {
				if (!thesis._rawPDF) {
					reject("this thesis hasn't pdf");
					return;
				}

				const file = this.bucket.file(makeKeyFor(thesis));

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
							password: thesis.password,
						},
					},
				});

				stream.on('finish', x => resolve(file.makePublic()));
				stream.on('error', reject);

				stream.end(thesis._rawPDF);
			})
			.then(() => this.getOverviewIndex())
			.then(overview => {
				overview.append(thesis, thesis.overview);

				return this._putIndex('index/overview', overview);
			})
			.then(() => this.getTextIndex())
			.then(text => {
				text.append(thesis, thesisText);

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
					const file = this.bucket.file(key);

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
		return this.bucket.file(key).download()
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


module.exports = Database;
module.exports.Index = Index;
