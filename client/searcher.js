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

				result[result.length-1].push({ elm: elm, from: idx, to: idx + q.length });
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
			result.push({ elm: elm, from: found.index, to: found.index + found[0].length })
		}

		return [result];
	}
}


function nonFilterQuery(elm, text) {
	return [[{ elm: elm }]];
}


function queryFunc(q) {
	if (q[0] === '/' && q[q.length - 1] === '/') {
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
	}).filter(x => x);
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


export const debug = {
	stringQuery: stringQuery,
	regexpQuery: regexpQuery,
	queryFunc: queryFunc,
	mergeFound: mergeFound,
	check: check,
	search: search,
	resultIndexOf: resultIndexOf,
	mergeResults: mergeResults,
};


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
			let results = search(overviewIndex, query, options).map(x => {
				x.data.overview = x.data.content;
				delete x.data.content;
				return x;
			});

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
						founds: query('text', x.content),
					})).map(x => {
						x.data.text = x.data.content;
						delete x.data.content;
						return x;
					}));
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
}
