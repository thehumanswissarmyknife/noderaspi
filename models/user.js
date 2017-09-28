const mongoose = require('mongoose');
const validator = require('validator');

var User = mongoose.model('User', {
	userName: {
		type: String,
		required: true,
		trim: true
	},
	userEmail: {
		type: String,
		required: true,
		trim: true,
		minlength: 5,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
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
	},
	userPassword: {
		type: String,
		required: true,
		minLength: 6
	},
	tokens: [{
		access: {
			type: String,
			required: true
		},
		tocken: {
			type: String,
			required: true
		}
	}]
});

module.exports = {User};