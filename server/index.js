const path = require('path');

const express = require('express');
const app = express();

const server = app.listen(process.env.PORT || 8080, () => {
	console.log('listening on :' + server.address().port);
});


app.use(require('morgan')('combined'));

app.use(express.static(path.join(__dirname, '../build/')));

app.use(/\/(|detail|search|upload|20[0-9][0-9]\/[^\/]+\/.+)$/, (req, res) => {
	res.sendFile(path.join(__dirname, '../build/index.html'));
});
