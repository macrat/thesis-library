import Marker from './marker';


export function stringQuery(query) {
	const ignoreCase = !/[A-Z]/.test(query) && /[a-z]/.test(query);
	const queries = query.split(' ').filter(x => x.length > 0);

	return function(elm, text) {
		const result = [];

		if (ignoreCase) {
			text = text.toLowerCase();
		}

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


export function regexpQuery(query) {
	const ignoreCase = !/[A-Z]/.test(query) && /[a-z]/.test(query);
	const re = new RegExp(query, 'g' + (ignoreCase ? 'i' : ''));

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


export function emptyQuery(elm, text) {
	return [[new Marker(0, 0, elm)]];
}


export default function queryFunc(q) {
	if (q.length >= 3 && q[0] === '/' && q[q.length - 1] === '/') {
		return regexpQuery(q.slice(1, q.length - 1));
	} else if (q.trim()) {
		return stringQuery(q);
	} else {
		return emptyQuery;
	}
}
