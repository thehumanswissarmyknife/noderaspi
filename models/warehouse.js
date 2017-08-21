var mongoose = require('mongoose');

var Warehouse = mongoose.model('Warehouse', {
	name: {
		type: String,
		required: true,
		trim: true
	},
	category: {
		type: String,
		required: true
	}
	// do we need the LIST ID???????
});

module.exports = {Warehouse};