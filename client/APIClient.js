import axios from 'axios';


export default class {
	constructor(origin=null) {
		if (origin) {
			this.origin = origin;
		} else {
			this.origin = location.origin;
		}
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
		return axios.get(`${this.origin}/api/index/overview`)
			.then(response => response.data);
	}

	getTextIndex() {
		return axios.get(`${this.origin}/api/index/text`)
			.then(response => response.data);
	}
}
