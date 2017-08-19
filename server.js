var express = require('express');
var bodyParser = require('body-parser');

 const hbs = require('hbs');
 const fs = require ('fs');

var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Product} = require('./models/product');



// var newUser = new User({
// 	userName: '  denis',
// 	userEmail: 'dv@peter.de',
// 	userFunction: 'counter',
// 	userLevel: 'noob'
// });
// newUser.save().then((user) => {
// 	console.log('User created: ', user);
// }, (e) => {
// 	console.log('User not created: ', e);
// });

// var newProduct= new Product({
// 	code: 'meinProd2222222',
// 	description: 'toll',
// 	oldCode: 'FALSE',
// 	batchNumberMandatory: false
// });

// newProduct.save().then((prod) => {
// 	console.log('Product created: ', prod);
// }, (e) => {
// 	console.log('Product not created: ', e);
// });


// Server stuff
var app = express();
app.listen(3000, () => {
	console.log('server is up and listening to pport 3000');
});
app.use(bodyParser.json());

app.post('/products', (req, res) => {
	console.log(req.body);
	var prod = new Product(req.body);
	prod.save().then((prod) => {
		res.status(200).send(prod);
		console.log('product created', prod.code);
	}, (e) => {
		res.status(400).send(e);
		console.log(e);
	});

});
// app.set('view engine', 'hbs');

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

