var mongoose = require('mongoose');

var User = mongoose.model('User', {
	userName: {
		type: String,
		required: true,
		trim: true
	},
	userEmail: {
		type: String,
		required: true,
		trim: true
	}, 
	userFunction: {
		type: String,
		required: true,
		trim: true
	},
	userLevel: {
		type: String,
		required: true,
		trim: true
	}
});

module.exports = {User};