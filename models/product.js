var mongoose = require('mongoose');

var Product = mongoose.model('Product', {
	code: {
		type: String,
		required: true,
		minlength: 11,
		trim: true
	},
	description: {
		type: String,
		required: true,
		minlength: 1,
		trim: true
	}, 
	oldCode: {
		type: String,
		trim: true,
		default: ''
	},
	batchNumberMandatory: {
		type: Boolean,
		required: true
	},
	lastUpdate: {
		type: Number
	}
});

module.exports = {Product};