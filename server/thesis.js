const md5 = require('md5');

const pdf = require('./pdf');
const makeKey = require('./utils').makeKey;


class Thesis {
	constructor(obj) {
		if (!obj) throw 'obj was undefined';

		this.year = Number(obj.year);
		this.degree = obj.degree;
		this.author = obj.author;
		this.title = obj.title;
		this.overview = obj.overview;
		this.memo = obj.memo;
		this._rawPDF = obj.rawPDF;
		this.password = obj.password;
		
		if (!this.password && typeof obj.rawPassword === 'string') {
			this.password = md5(obj.rawPassword);
		}

		if (!this._rawPDF && typeof obj.pdf === 'string') {
			this._rawPDF = new Buffer(obj.pdf, 'base64');
		}

		if (this.memo === undefined) {
			this.memo = '';
		}


		if (obj.year === undefined) throw 'missing year';
		if (this.degree === undefined) throw 'missing degree';
		if (this.author === undefined) throw 'missing author';
		if (this.title === undefined) throw 'missing title';
		if (this.overview === undefined) throw 'missing overview';
		if (obj.password === undefined && obj.rawPassword === undefined) throw 'missing password';

		if (!/^[0-9]+$/.test(obj.year)) throw 'invalid year';
		if (typeof this.author !== 'string' || this.author.length === 0) throw 'invalid author';
		if (typeof this.title !== 'string' || this.title.length === 0) throw 'invalid title';
		if (typeof this.overview !== 'string' || this.overview.length === 0) throw 'invalid overview';
		if (typeof this.memo !== 'string') throw 'invalid memo';
		if (typeof this.password !== 'string' || this.password.length === 0) throw 'invalid password';

		if (this.degree !== 'bachelor' && this.degree !== 'master' && this.degree !== 'doctor') {
			throw 'invalid degree';
		}
	}

	hasPDF() {
		return !!this._rawPDF;
	}

	get key() {
		return makeKey(this.year, this.author, this.title);
	}

	getPDF(bucket) {
		if (this._rawPDF) {
			return Promise.resolve(this._rawPDF);
		} else {
			return bucket.file(this.key).download().then(data => {
				this._rawPDF = data[0];
				return this._rawPDF;
			});
		}
	}

	getText(bucket) {
		return this.getPDF(bucket).then(pdf.toText);
	}

	asSendableJSON() {
		return {
			year: this.year,
			degree: this.degree,
			author: this.author,
			title: this.title,
			overview: this.overview,
			memo: this.memo,
			downloadURL: `https://storage.googleapis.com/${process.env.GCLOUD_BUCKET}/${this.year}/${encodeURIComponent(this.author)}/${encodeURIComponent(this.title)}`,
		};
	}

	checkPassword(password) {
		return this.password === md5(password);
	}
}


module.exports = Thesis;
