module.exports.makeKey = function(year, author, title) {
	if (!year || !author || !title) {
		throw 'missing argument';
	}
	return `${year}/${author}/${title}`;
}


module.exports.makePassword = function() {
	const set = 'ABCDEFGHJKLMNRWXY347';
	const r = [];
	for (let i=0; i<6; i++) {
		r.push(set[Math.floor(Math.random()*set.length)]);
	}
	return r.join('');
}
