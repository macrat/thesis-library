const zlib = require('zlib');

const Storage = require('@google-cloud/storage');

const Thesis = require('./thesis');
const makeKey = require('./utils').makeKey;


class Index {
	constructor(obj) {
		this.data = {};
		(obj || []).forEach(x => {
			this.data[makeKey(x.year, x.author, x.title)] = x;
		});
	}

	append(thesis, content) {
		this.data[thesis.key] = {
			year: thesis.year,
			author: thesis.author,
			title: thesis.title,
			degree: thesis.degree,
			content: content,
		};
	}

	remove(thesis) {
		delete this.data[makeKey(thesis.year, thesis.author, thesis.title)];
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
		if (process.env.GCLOUD_SERVICE_ACCOUNT) {
			this.storage = Storage({
				projectId: process.env.GCLOUD_PROJECT,
				credentials: JSON.parse(process.env.GCLOUD_SERVICE_ACCOUNT),
			});
		} else {
			this.storage = Storage({ projectId: process.env.GCLOUD_PROJECT });
		}
		this.bucket = this.storage.bucket(process.env.GCLOUD_BUCKET);
	}

	get(year, author, title) {
		return this.bucket.file(makeKey(year, author, title)).getMetadata().then(data => {
			return new Promise((resolve, reject) => {
				zlib.gunzip(new Buffer(data[1].metadata.metadata, 'base64'), (err, metadata) => {
					if (err) {
						reject(err);
					} else {
						resolve(new Thesis(Object.assign(JSON.parse(metadata.toString()), { password: data[1].metadata.password })));
					}
				});
			});
		});
	}

	getPDF(thesis) {
		return thesis.getPDF(this.bucket);
	}

	put(thesis) {
		return thesis.getText(this.bucket).then(thesisText => {
			return new Promise((resolve, reject) => {
				if (!thesis._rawPDF) {
					reject("this thesis hasn't pdf");
					return;
				}

				const file = this.bucket.file(thesis.key);

				zlib.gzip(JSON.stringify(thesis.asSendableJSON()), {level:9}, (err, binary) => {
					if (err) {
						reject(err);
						return;
					}

					const stream = file.createWriteStream({
						metadata: {
							contentType: "application/pdf",
							cacheControl: 24 * 60 * 60,
							metadata: {
								metadata: new Buffer(binary).toString('base64'),
								password: thesis.password,
							},
						},
					});

					stream.on('finish', x => resolve(file.makePublic()));
					stream.on('error', reject);

					stream.end(thesis._rawPDF);
				});
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

	remove(thesis) {
		this.getTextIndex()
			.then(text => {
				text.remove(thesis);

				return this._putIndex('index/text', text);
			})
			.then(() => this.getOverviewIndex())
			.then(overview => {
				overview.remove(thesis);

				return this._putIndex('index/overview', overview);
			})
			.then(() => {
				return this.bucket.file(thesis.key).delete();
			})
			.then(() => null);
	}

	updateMetadata(oldThesis, newThesis) {
		if (newThesis.password !== oldThesis.password) {
			throw 'can not change password';
		}

		const keyChanged = oldThesis.key !== newThesis.key;

		return Promise.resolve()
			.then(() => {
				if (newThesis.hasPDF()) {
					return Promise.all([oldThesis.getText(this.bucket), newThesis.getText(this.bucket)]).then(texts => {
						if (keyChanged || texts[0] !== texts[1]) {
							return this.getTextIndex().then(text => {
								text.remove(oldThesis);
								text.append(newThesis, texts[1]);

								return this._putIndex('index/text', text);
							});
						}
					});
				} else {
					if (keyChanged) {
						return Promise.all([oldThesis.getText(this.bucket), this.getTextIndex()]).then(data => {
							data[1].remove(oldThesis);
							data[1].append(newThesis, data[0]);

							return this._putIndex('index/text', data[1]);
						});
					}
				}
			})
			.then(() => {
				if (keyChanged || oldThesis.overview !== newThesis.overview) {
					return this.getOverviewIndex().then(overview => {
						overview.remove(oldThesis);
						overview.append(newThesis, newThesis.overview);

						return this._putIndex('index/overview', overview);
					});
				}
			})
			.then(() => {
				if (oldThesis.key !== newThesis.key) {
					return this.bucket.file(oldThesis.key).move(newThesis.key).then(result => {
						return result[0].makePublic();
					})
				}
			})
			.then(() => new Promise((resolve, reject) => {
				const file = this.bucket.file(newThesis.key);

				const newMetadata = JSON.stringify(newThesis.asSendableJSON());
				if (newMetadata === JSON.stringify(oldThesis.asSendableJSON())) {
					resolve();
					return;
				}

				zlib.gzip(newMetadata, {level:9}, (err, binary) => {
					if (err) {
						reject(err);
					}

					resolve(file.setMetadata({
						metadata: {
							metadata: new Buffer(binary).toString('base64'),
						},
					}));
				});
			}))
			.then(() => null);
	}

	update(oldThesis, newThesis) {
		if (oldThesis.key === newThesis.key) {
			return this.put(newThesis);
		} else {
			return this.put(newThesis).then(() => this.remove(oldThesis));
		}
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
			.catch(err => [])
			.then(x => new Index(JSON.parse(x[0] || '[]')));
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
