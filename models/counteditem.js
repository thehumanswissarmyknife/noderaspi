var mongoose = require('mongoose');

var CountedItem = mongoose.model('CountedItem', {
	productCode: {
		type: String,
		required: true,
		minlength: 11,
		trim: true
	},
	batchId: {
		type: String,
		required: true
	}, 
	totalQuantity: {
		type: Number,
		required: true
	},
	sud: {
		type: Number,
		required: true
	}, 
	user: {
		type: String,
		required: true
	}
});

module.exports = {CountedItem};