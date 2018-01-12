const PDFParser = require('pdf2json');


module.exports.toText = function(pdf) {
	return new Promise((resolve, reject) => {
		const parser = new PDFParser();

		parser.on('pdfParser_dataReady', data => {
			const lines = [];
			let lastY = 0, lastX = 0;

			data.formImage.Pages.forEach(page => {
				page.Texts.forEach(text => {
					if (Math.abs(lastY - text.y) > 0.1) {
						lines.push(decodeURIComponent(text.R[0].T));
					} else {
						if (Math.abs(lastX - text.x) > 1.0) {
							lines[lines.length - 1] += ' ';
						}
						lines[lines.length - 1] += decodeURIComponent(text.R[0].T);
					}
					lastY = text.y;
					lastX = text.x + text.w;
				});
			});

			resolve(lines.join('\n'));
		});
		parser.on('pdfParser_dataError', err => reject(err));

		parser.parseBuffer(pdf)
	});
}
