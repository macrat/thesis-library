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
