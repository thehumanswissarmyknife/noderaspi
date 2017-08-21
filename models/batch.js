var mongoose = require('mongoose');

var Batch = mongoose.model('Batch', {
	productCode: {
		type: String,
		required: true,
		minlength: 11,
		trim: true
	},
	batchNumber: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	}, 
	expiryDate: {
		type: Number,
		trim: true,
		required: true
	},
	sud: {
		type: Number,
		required: true
	}
});

module.exports = {Batch};