const {ObjectID} = require('mongodb');
const {mongoose} = require('./db/mongoose');
const {Product} = require('./models/product');

var id = '5998619807a91f06fb8c0056';
var din = new RegExp(/din/i);

if (!ObjectID.isValid(id)) {
	return console.log("ID is not valid");
};

Product.find({
	code: din
}).then((products) => {
	console.log("Products: ", products);
});

Product.findOne({
	_id: id
}).then((product) => {
	if(!product){
		return console.log('no item found');
	}
	console.log('ID:', product);
});

Product.findById(id).then((product) => {
	if(!product){
		return console.log("ID not found");
	}
	console.log("found by id:", product);
});