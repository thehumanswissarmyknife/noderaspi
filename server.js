var express = require('express');
var bodyParser = require('body-parser');

 const hbs = require('hbs');
 const fs = require ('fs');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Product} = require('./models/product');


// Server stuff
var app = express();
app.listen(3000, () => {
	console.log('server is up and listening to port 3000\n');
});
app.use(bodyParser.json());

app.post('/products', (req, res) => {

	var product = new Product(req.body);
	product.save().then((product) => {
		res.status(200).send(product);
	}, (e) => {
		res.status(400).send(e);
		// console.log(e);
	});

});

app.get('/products', (req, res) => {
	Product.find().then((products) => {
		res.send({products});
	}, (e) => {
		res.status(400).send(e);
})

}); 

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
	res.send('<h1>no content</h1>');
});

app.get('/setup', (req, res) => {
	res.render('setup.hbs', {
		pageTitle: 'Setup'
	});
});

module.exports = {app};

