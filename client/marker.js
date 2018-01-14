export function joinMarks(marks) {
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
		return joinMarks(result);
	}
}


export default class Marker {
	constructor(from, to, elm=null) {
		this.from = from;
		this.to = to;
		this.elm = elm;
	}

	isOverwrapWith(mark) {
		return this.from <= mark.to && mark.from <= this.to;
	}

	get length() {
		return this.to - this.from;
	}

	merge(mark) {
		if (!this.isOverwrapWith(mark)) {
			throw 'is not overwraped';
		}
		return new Marker(Math.min(this.from, mark.from), Math.max(this.to, mark.to));
	}
}
