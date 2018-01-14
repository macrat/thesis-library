import { EventEmitter } from 'events';
import axios from 'axios';


export default class {
	constructor(origin=null) {
		if (origin) {
			this.origin = origin;
		} else {
			this.origin = location.origin;
		}

		this._event = new EventEmitter();
	}

	getMetadata(year, author, title) {
		return axios.get(`${this.origin}/api/thesis/${year}/${encodeURIComponent(author)}/${encodeURIComponent(title)}/metadata`).then(resp => resp.data);
	}

	getQuickMetadata(year, author, title) {
		if ('serviceWorker' in navigator) {
			return axios.get(`${location.origin}/api-worker/quick-metadata/${year}/${encodeURIComponent(author)}/${encodeURIComponent(title)}`)
				.then(response => response.data)
				.catch(err => {});
		} else {
			return Promise.resolve({});
		}
	}

	getYearList() {
		return axios.get(`${this.origin}/api/thesis/`).then(resp => resp.data);
	}

	getThesisesOfYear(year) {
		return axios.get(`${this.origin}/api/thesis/${year}/`).then(resp => resp.data);
	}

	getOverviewIndex() {
		return axios.get(`${this.origin}/api/index/overview`).then(resp => resp.data);
	}

	getTextIndex() {
		return axios.get(`${this.origin}/api/index/text`).then(resp => resp.data);
	}

	checkPassword(year, author, title, password) {
		if (!year || !author || !title || !password) {
			return Promise.resolve(false);
		}

		return axios.post(`${location.origin}/api/thesis/${year}/${encodeURIComponent(author)}/${encodeURIComponent(title)}/check-password`, { password: password })
			.then(resp => resp.data.result == 'correct')
	}

	post(thesis) {
		if (!thesis || !thesis.author || !thesis.degree || !thesis.year || !thesis.year || !thesis.overview || !thesis.pdf) {
			return Promise.reject('missing member value');
		}

		return axios.post('/api/post', {
			author: thesis.author,
			degree: thesis.degree,
			year: Number(thesis.year),
			title: thesis.title,
			overview: thesis.overview,
			memo: thesis.memo,
			pdf: thesis.pdf,
		}).then(result => {
			this.clearCache();
			return result.data;
		});
	}

	update(oldYear, oldAuthor, oldTitle, thesis, password) {
		if (!oldYear || !oldAuthor || !oldTitle || !thesis || !password) {
			return Promise.reject('missing argument');
		}

		const data = {
			author: thesis.author,
			degree: thesis.degree,
			year: Number(thesis.year),
			title: thesis.title,
			overview: thesis.overview,
			memo: thesis.memo,
			password: password,
		};

		if (thesis.pdf) {
			data.pdf = thesis.pdf;
		}

		return axios.post(`${this.origin}/api/thesis/${oldYear}/${encodeURIComponent(oldAuthor)}/${encodeURIComponent(oldTitle)}/update`, data).then(() => {
			this.clearCache();
		});
	}

	clearCache() {
		this._event.emit('clear-cache');

		if ('serviceWorker' in navigator) {
			axios.get(`${location.origin}/api-worker/clear-cache`).catch(console.error);
		}
	}

	on(name, fun) {
		this._event.addListener(name, fun);
	}

	off(name, fun) {
		this._event.removeListener(name, fun);
	}
}
