function stringQuery(query) {
	const queries = query.split(' ').filter(x => x.length > 0);

	return function(elm, text) {
		const result = [];

		for (let q of queries) {
			result.push([]);

			let idx = -1;
			while (idx < text.length) {
				idx = text.indexOf(q, idx + 1);

				if (idx < 0) {
					break;
				}

				result[result.length-1].push(new Marker(idx, idx + q.length, elm));
			}
		}

		return result;
	}
}


function regexpQuery(query) {
	const re = new RegExp(query, 'g');

	return function(elm, text) {
		re.lastIndex = 0;
		const result = [];

		let found = null;
		while (found = re.exec(text)) {
			result.push(new Marker(found.index, found.index + found[0].length, elm));
		}

		return [result];
	}
}


function nonFilterQuery(elm, text) {
	return [[new Marker(0, 0, elm)]];
}


function queryFunc(q) {
	if (q.length >= 3 && q[0] === '/' && q[q.length - 1] === '/') {
		return regexpQuery(q.slice(1, q.length - 1));
	} else if (q.trim()) {
		return stringQuery(q);
	} else {
		return nonFilterQuery;
	}
}


function mergeFound(founds) {
	const result = founds[0];

	founds.slice(1).forEach(found => {
		found.forEach((x, i) => x.forEach(y => result[i].push(y)));
	});

	return result;
}


function check(found) {
	for (let f of found) {
		if (f.length == 0) {
			return false;
		}
	}
	return true;
}


function search(list, query, options) {
	return list.map(x => {
		const founds = [];

		if (options.title) {
			founds.push(query('title', x.title));
		}
		if (options.author) {
			founds.push(query('author', x.author));
		}

		return { data: x, founds: mergeFound(founds) };
	});
}


function resultIndexOf(xs, x) {
	for (let i=0; i<xs.length; i++) {
		if (x.data.year === xs[i].data.year
		&& x.data.author === xs[i].data.author
		&& x.data.title === xs[i].data.title) {

			return i;
		}
	}
	return -1;
}


function mergeResults(a, b) {
	const result = a.map(x => {
		const idx = resultIndexOf(b, x);

		if (idx < 0) {
			return x;
		}

		return {
			data: Object.assign(x.data, b[idx].data),
			founds: mergeFound([x.founds, b[idx].founds]),
		};
	});

	b.forEach(x => {
		if (resultIndexOf(a, x) < 0) {
			result.push(x);
		}
	});

	return result;
}


function sanitize(str) {
	return str.replace(/[&'`"<>]/g, m => ({
		'&': '&amp;',
		"'": '&#x27;',
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;',
	}[m]));
}


function joinMarks(marks) {
	const result = [];
	marks.forEach(x => {
		let found = false;
		for (let i=0; i<result.length; i++) {
			const y = result[i];
			if (x.isOverwrapWith(y)) {
				result[i] = x.merge(y);
				found = true;
				break;
			}
		}
		if (!found) {
			result.push(x);
		}
	});
	if (result.length === marks.length) {
		return result;
	} else {
		return this.joinMarks(result);
	}
}


function markup(text, marks) {
	if (marks.length == 0) {
		return sanitize(text);
	}

	marks = marks.filter(x => x.from !== x.to).sort((x, y) => x.from - y.from);

	const offset = Math.max(0, marks[0].from - 251 + Math.round(marks[0].length/2));
	marks = marks.filter(x => offset < x.to && x.from < offset + 500);

	let last = 0;
	const splitted = marks.map(m => {
		const result = [text.slice(last, m.from), text.slice(m.from, m.to)];
		last = m.to;
		return result;
	});

	splitted[0][0] = splitted[0][0].slice(offset);

	return (splitted.map(x => `${sanitize(x[0])}<mark>${sanitize(x[1])}</mark>`).join('') + sanitize(text.slice(last, offset + 501)));
}


export const debug = {
	stringQuery: stringQuery,
	regexpQuery: regexpQuery,
	queryFunc: queryFunc,
	mergeFound: mergeFound,
	check: check,
	search: search,
	resultIndexOf: resultIndexOf,
	mergeResults: mergeResults,
	sanitize: sanitize,
	joinMarks: joinMarks,
	markup: markup,
};


export class Marker {
	constructor(from, to, elm=null) {
		this.from = from;
		this.to = to;
		this.elm = elm;
	}

	isOverwrapWith(mark) {
		return this.from <= mark.to && mark.from <= this.to;
	}

	get length() {
		return this.to - this.from + 1;
	}

	merge(mark) {
		return new Marker(Math.min(this.from, mark.from), Math.max(this.to, mark.to));
	}
}


export default class {
	constructor(apiClient) {
		this._client = apiClient;

		this.defaultOptions = {
			title: true,
			author: false,
			degree: null,
			yearFrom: null,
			yearTo: null,
			overview: true,
			text: false,
		};

		this._client.getOverviewIndex().catch(console.error);
	}

	search(query, options={}) {
		query = queryFunc(query);
		options = Object.assign(Object.assign({}, this.defaultOptions), options);

		return this._client.getOverviewIndex().then(overviewIndex => {
			let results = search(overviewIndex, query, options);

			if (options.overview) {
				results = results.map(x => ({
					data: x.data,
					founds: mergeFound([query('overview', x.data.overview), x.founds]),
				}));
			}

			if (options.text) {
				return this._client.getTextIndex().then(textIndex => {
					return mergeResults(results, textIndex.map(x => ({
						data: x,
						founds: query('text', x.text),
					})));
				});
			}

			return results;
		}).then(results => {
			return results.filter(x => {
				if (!check(x.founds)
				|| (options.degree && options.degree !== x.data.degree)
				|| (options.yearFrom && options.yearFrom > x.data.year)
				|| (options.yearTo && options.yearTo < x.data.year)) {
					return false;
				}

				return true;
			});
		});
	}

	makeHTML(thesis) {
		const titleMarks = [];
		const authorMarks = [];
		const overviewMarks = [];
		const textMarks = [];

		thesis.founds.forEach(xs => {
			xs.forEach(x => {
				if (x.elm === 'title') {
					titleMarks.push(x);
				}
				if (x.elm === 'author') {
					authorMarks.push(x);
				}
				if (x.elm === 'overview') {
					overviewMarks.push(x);
				}
				if (x.elm === 'text') {
					textMarks.push(x);
				}
			});
		});

		let html = '';
		if (thesis.data.text && (textMarks.length > 0 || overviewMarks.length === 0)) {
			html = markup(thesis.data.text, textMarks);
		} else {
			html = markup(thesis.data.overview, overviewMarks);
		}

		return {
			year: thesis.data.year,
			author: thesis.data.author,
			title: thesis.data.title,
			degree: thesis.data.degree,
			html: html,
			authorHTML: markup(thesis.data.author, authorMarks),
			titleHTML: markup(thesis.data.title, titleMarks),
		};
	}
}
