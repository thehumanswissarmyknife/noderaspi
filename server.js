
// general utils
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');
const _ = require('lodash');
var bodyParser = require('body-parser');
const hbs = require('hbs');
const fs = require ('fs');

// Myd models
var {User} = require('./models/user');
var {Product} = require('./models/product');
var {Batch} = require('./models/batch');
var {CountedItem} = require('./models/counteditem');
var {Message} = require('./models/message');
var {ReportingList} = require('./models/reportinglist');
var {Warehouse} = require('./models/warehouse');




// the server and socket
var app = require('express')();
const socketIO = require('socket.io');
var server = require('http').createServer(app);
var io = require('socket.io')(server);

// server.listen(3000);
server.listen(3000, () => {
	console.log('server is up and listening to port 3000\n');
});

// my constants
const myVersion = "1.0";

// SOCKET IO
// initial connection
io.on('connection', (socket) => {
  console.log('New user connected', socket.id);

// write the connection into the logfile
  var now = new Date().toString();
  var logLine = `${now}: ID - ${socket.id}`;
  console.log(logLine);
  fs.appendFile('logs/socketIO.log', logLine +  '\n', (err) => {
  	if (err) {
  		console.log('Unable to write to file server.log');
  	}
  });

// send the latest info to the client: last countedItem and the totale counted Items
  // var lastServerCI = getLastServerCI(socket);

  // // listen to newBatch - events
  // socket.on('newBatch', async (newBatch) => {
  // 	var thisBatch = new Batch(newBatch);
  // 	console.log('newBatchreceived', {newBatch, status: 'created'});

  // 	try {
  // 		var savedBatch = await thisBatch.save();
  // 		console.log('Batch saved', {newBatch, status: 'created'});
  // 	  	socket.emit('batchCreated', {newBatch, status: 'created'});
  // 	} catch (e) {
  // 		console.log('ERROR: Batch saved', e);
  // 		socket.emit('batchSavingError', e);
  // 	}
  // });

  socket.on('getInitialSetup', async () => {
  	console.log('initial setup, sending ...');
  	try {
  		var users = await User.find();
  		var products = await Product.find();
  		var warehouses = await Warehouse.find();
  		var reportinglists = await ReportingList.find();
  		var messages = await Message.find();
  		socket.emit('sendInitialSetup', {
  			qUsers: users.length, 
  			users, 
  			qProducts: products.length, 
  			products, 
  			qWarehouses: warehouses.length, 
  			warehouses,
  			qReportinglists: reportinglists.length,
  			reportinglists, 
  			qMessages: messages.length,
  			messages
  		});
  	} catch (e) {
  		console.log()
  	}
  })

  socket.on('getProducts', async () => {
  	console.log("someone wants all products", "yeah");

  	try {
		var products = await Product.find();
		socket.emit('allProducts', {count: products.length, products});
	} catch (e) {
		console.log('ERROR: Batch saved', e);
	}

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


var getLastServerCI = async (socket) =>{

	let lastServerCI;
	let totalCountedItems;

	// try{
	// 	lastServerCI = await CountedItem.find({}, {_id: 1}).sort({_id: -1}).limit(1);
	// 	totalCountedItems = await CountedItem.count();
	// } catch (e) {
	// 	logger.err('MongoError', e);
	// }
	
	var object = {
		lastServerCI: lastServerCI[0]._id,
		totalCountedItemsOnServer: totalCountedItems
	}
	socket.emit('lastServerCI', object);

	return object;
};

app.use(bodyParser.json());


app.post('/products', async (req, res) => {

	// regular expression to check for codes in the old codes field
	var codeRG = new RegExp(req.body.code);
	try {
		var product = await Product.find({$or: [{code: codeRG}, {oldCode: codeRG}]});
		if(product.length>0){
			return res.status(404).send({product, error: 'already exists'});
		}
		var product = new Product(req.body);

		product = await product.save();
		res.status(200).send({product, status: 'created'});
	} catch (e) {
		res.status(400).send(e);
	}

});


// get ALL products
app.get('/products', async (req, res) => {

	try {
		var products = await Product.find();
		res.status(200).send({count: products.length, products});
	} catch (e) {
		res.status(400).send(e);
	}
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

// get ALL batches for ALL products
app.get('/lastBatchAdded', async (req, res) => {
	try{
		let lastBatchAdded = await Batch.find().sort({_id: -1}).limit(1);
		res.status(200).send(lastBatchAdded);
	} catch (e) {
		res.status(400).send(e);
	}
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

// app.patch('/counteditems/:id', (req, res) => {
// 	var id = req.params.id;
// 	var body = _.pick(req.body, ['productCode', 'batchId', 'totalQuantity', 'sud', 'user']);

// 	if(!ObjectID.isValid(id)) {
// 		return res.status(404).send({error: "item not known"});
// 	}

// });

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

	var body = _.pick(req.body, ['userName', 'userEmail', 'userPassword', 'userLevel', 'userFunction']);
	var user = new User(body);
	user.save().then((user) => {
		res.status(200).send({user});
	}).catch((e) => {
		res.status(400).send({e});
	});

	// var user = new User(req.body);
	// user.save().then((user) => {
	// 	res.status(200).send({user, status: 'created'});
	// }, (e) => {
	// 	res.status(400).send(e);
	// 	// console.log(e);
	// });
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

// static directory for the / directory
app.get('/', (req, res) => {
	res.send({
		name: "MSF Stockcount Server",
		status: "online", 
		version: myVersion});
});

// render setup.hbs for the /setup route
app.get('/setup', (req, res) => {
	res.render('setup.hbs', {
		pageTitle: 'Setup'
	});
});

module.exports = {app};

