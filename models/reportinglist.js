var mongoose = require('mongoose');

var ReportingList = mongoose.model('ReportingList', {
	name: {
		type: String,
		required: true,
		trim: true
	},
	category: {
		type: String,
		required: true
	},
	comment: {
		type: String
	}
	// do we need the LIST ID???????
});

module.exports = {ReportingList};