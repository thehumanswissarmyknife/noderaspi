var express = require('express');
var bodyParser = require('body-parser');

 const hbs = require('hbs');
 const fs = require ('fs');

var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Product} = require('./models/product');
var {Batch} = require('./models/batch');
var {CountedItem} = require('./models/counteditem');
var {Message} = require('./models/message');
var {ReportingList} = require('./models/reportinglist');
var {Warehouse} = require('./models/warehouse');

// Server stuff
var app = express();
app.listen(3000, () => {
	console.log('server is up and listening to port 3000\n');
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

app.use(bodyParser.json());


app.post('/products', (req, res) => {

	// regular expression to check for codes in the old codes field
	var codeRG = new RegExp(req.body.code);

	// check if the product already exists?
	Product.find({$or: [{code: codeRG}, {oldCode: codeRG}]}).then((product) => {
		if(product.length>0){
			return res.status(404).send({product, error: 'already exists'});
		}
		var product = new Product(req.body);
		product.save().then((product) => {
			res.status(200).send({product, status: 'created'});
		}, (e) => {
			res.status(400).send(e);
		});
	});
});

// get ALL products
app.get('/products', (req, res) => {
	Product.find().then((products) => {
		res.status(200).send({count: products.length, products});
	}, (e) => {
		res.status(400).send(e);
	})

}); 

// get ONE product by ID
app.get('/products/:id', (req, res) => {

	// check if the given ID is valid, if not => tell them
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send({});
	} 

	var id = req.params.id;
	Product.findById(id).then((product) => {
			if (!product) {
				return res.status(404).send({});
			};
			res.status(200).send({product});
		}), (e) => {
			res.status(400).send({});
		}
});

// get ONE product by CODE
app.get('/productByCode/:code', (req, res) => {
	if(req.params.code.length<11) {
		return res.status(404).send({error: 'code too short'});
	}
	var code = req.params.code.trim();
	Product.find({
		code: code
	}).then((product) => {
		if(product.length===0){
			return res.status(404).send({error: 'Item not found'});
		}
		res.status(200).send({product});
	}), (e) => {
		res.status(400).send({});
	}
});

// BATCHES
// post one batch
app.post('/batches', (req, res) => {

// check if this batch already exists - FUZZILY


// if batch is new, create it and send back the ID
	var batch = new Batch(req.body);
	batch.save().then((batch) => {
		res.status(200).send({batch: batch, status: 'created'});
	}, (e) => {
		res.status(400).send(e);
	});
});

// get ALL batches for ALL products
app.get('/batches', (req, res) => {
	Batch.find().then((batches) => {
		res.status(200).send({batches});
	}, (e) => {
		res.status(400).send(e);
	});
});

// get ALL batches for ONE product
app.get('/batchesForProduct/:productCode', (req, res) => {
	var productCode = req.params.productCode.trim();
	Batch.find({
		productCode: productCode
	}).then((batches) => {
		if (batches.length === 0) {
			return res.status(404).send({error: 'no batches for this product'});
		};
		res.status(200).send({batches});
	}, (e) => {
		res.status(400).send(e);
	});
});

// COUNTED ITEMS

// post ONE counteditem

app.post('/counteditems', (req, res) => {
	
	var countedItem = new CountedItem(req.body);
	if (!ObjectID.isValid(countedItem.batchId)) {
		return res.status(404).send({error: 'batch it or counteitemID invalid'});
	};

// somethings wrong here!!!!!
	if(!ObjectID.isValid(countedItem.userId))
	var batchId = ObjectID(countedItem.batchId);

	if(Batch.findById(batchId) && User.findById()){
		console.log('yeah');
	}

	// look, if the batch exists
	Batch.findById(batchId).then((batch) =>{
		if(!batch) {
			return res.status(404).send({error: 'Batch does not exist'});
		}

	});

	countedItem.save().then((countedItem) => {
		res.status(200).send({countedItem, status: 'created'});
	}, (e) => {
		res.status(400).send(e);
	});
});

// retrieve all countedItems

app.get('/counteditems', (req, res) => {
	CountedItem.find().then((countedItems) => {
		res.status(200).send({countedItems});
	}, (e) => {
		res.status(400).send(e);
	})
});

// retrieve ONE countedItem by ID
app.get('/counteditems/:id', (req, res) => {
	if(!ObjectID.isValid(req.params.id)){
		return res.status(404).send({error: 'bad id'});
	};

	var id = req.params.id;
	CountedItem.findById(id).then((countedItems) => {
		res.status(200).send({countedItems});
	}, (e) => {
		res.status(400).send(e);
	})
});

// retrieve all counteditems for ONE product by CODE
app.get('/counteditemsForProductcode/:productCode', (req, res) => {
	var productCode = req.params.productCode;
	CountedItem.find({
		code: productCode}
		).then((countedItems) => {
		res.status(200).send({countedItems});
	}, (e) => {
		res.status(400).send(e);
	})

});

// USERS

// only for intial testing!!!!!
// post ONE user
app.post('/users', (req, res) => {

	var user = new User(req.body);
	user.save().then((user) => {
		res.status(200).send({user, status: 'created'});
	}, (e) => {
		res.status(400).send(e);
		// console.log(e);
	});
});

// get ALL users
app.get('/users', (req, res) => {
	User.find().then((users) => {
		res.status(200).send({users});
	}, (e) => {
		res.status(400).send(e);
	})

}); 

// get ONE user by ID
app.get('/users/:id', (req, res) => {
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send({});
	} 

	var id = req.params.id;
	User.findById(id).then((user) => {
			if (!user) {
				return res.status(404).send({});
			};
			res.status(200).send({user});
		}), (e) => {
			res.status(400).send({});
		}
});

// MESSAGES

// post one message
app.post('/messages', (req, res) => {
	var message = new Message(req.body);
	message.save().then((message) => {
		res.status(200).send({message, status: 'created'});
	}, (e) => {
		res.status(400).send(e);
	});
});

// get ALL messages
app.get('/messages', (req, res) => {
	Message.find().then((messages) => {
		res.status(200).send({messages});
	}, (e) => {
		res.status(400).send({e});
	});
});

app.get('/messages/:recipientId', (req, res) => {
	var recipientId = req.params.recipientId;

	if (!ObjectID.isValid(recipientId)) {
		return res.status(404).send({error: 'invalid userid'});
	};

	Message.find({ $or: [
		{recipientId: recipientId}, 
		{recipientId: 'allusers'}]
	}).then((messages) => {
		if(!messages) {
			return res.status(200).send({status: 0, message: 'no new messages'});
		}
		res.status(200).send(messages);
	}, (e) => {
		res.status(400).send({e});
	});
});

// REPORTINGLISTS
// get ALL reportinglists
app.get('/reportinglists', (req, res) => {
	ReportingList.find().then((reportinglists) => {
		res.status(200).send({reportinglists});
	}, (e) => {
		res.status(400).send({e});
	})
});

// WAREHOUSES
// get all warehouses
app.get('/warehouses', (req, res) => {
	Warehouse.find().then((warehouses) => {
		res.status(200).send({warehouses});
	}, (e) => {
		res.status(400).send({e});
	})
})


//  what do we want to see, when we log into the server???

app.get('/', (req, res) => {
	res.send({
		name: "MSF Stockcount Server",
		status: "online", 
		version: "1.0"});
});

app.get('/setup', (req, res) => {
	res.render('setup.hbs', {
		pageTitle: 'Setup'
	});
});

module.exports = {app};

