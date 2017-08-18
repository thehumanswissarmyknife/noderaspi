const express = require('express');
const hbs = require('hbs');
const fs = require ('fs');

var app = express();
app.set('view engine', 'hbs');

// get a log of what requests were done!
app.use((req, res, next) => {
	var now = new Date().toString();
	var logLine = `${now}: ${req.method}${req.originalUrl}`;
	console.log(logLine);
	fs.appendFile('logs/server.log', logLine +  '\n', (err) => {
		if (err) {
			console.log('Unable to write to file server.log');
		}
	});
	next();
});

app.get('/', (req, res) => {
	res.send('<h1>hello</h1>');
});

app.get('/setup', (req, res) => {
	res.render('setup.hbs', {
		pageTitle: 'Setup'
	});
});

app.listen(3000, () => {
	console.log('server is up and listening to pport 3000');
});