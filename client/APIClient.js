import { EventEmitter } from 'events';
import axios from 'axios';


export default class {
	constructor(origin=null) {
		if (origin) {
			this.origin = origin;
		} else {
			this.origin = location.origin;
		}

		this._overviewIndex = null;
		this._textIndex = null;

		this._event = new EventEmitter();
	}

	getMetadata(year, author, title) {
		return axios.get(`${this.origin}/api/thesis/${year}/${author}/${title}/metadata`)
			.then(response => response.data);
	}

	getYearList() {
		return axios.get(`${this.origin}/api/thesis/`)
			.then(response => response.data)
	}

	getThesisesOfYear(year) {
		return axios.get(`${this.origin}/api/thesis/${year}/`)
			.then(response => response.data)
	}

	getOverviewIndex() {
		if (this._overviewIndex) {
			return Promise.resolve(this._overviewIndex);
		} else {
			return axios.get(`${this.origin}/api/index/overview`).then(response => {
				this._overviewIndex = response.data;
				return this._overviewIndex;
			});
		}
	}

	getTextIndex() {
		if (this._textIndex) {
			return Promise.resolve(this._textIndex);
		} else {
			return axios.get(`${this.origin}/api/index/text`).then(response => {
				this._textIndex = response.data;
				return this._textIndex;
			});
		}
	}

	clearCache() {
		this._overviewIndex = null;
		this._textIndex = null;
		this._event.emit('clear-cache');
	}

	on(name, fun) {
		this._event.addListener(name, fun);
	}

	off(name, fun) {
		this._event.removeListener(name, fun);
	}
}
