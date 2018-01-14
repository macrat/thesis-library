export default function(str) {
	return str.replace(/[&'`"<>]/g, m => ({
		'&': '&amp;',
		"'": '&#x27;',
		'"': '&quot;',
		'<': '&lt;',
		'>': '&gt;',
	}[m]));
}
