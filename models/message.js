var mongoose = require('mongoose');

var Message = mongoose.model('Message', {
	topic: {
		type: String,
		required: true,
		trim: true
	},
	senderId: {
		type: String,
		required: true,
		trim: true
	}, 
	recipientId: {
		type: String,
		trim: true,
		required: true
	},
	status: {
		type: String,
		required: true
	},
	message: {
		type: String,
		required: true
	}
});

module.exports = {Message};