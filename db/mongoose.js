const mongoose = require('mongoose');

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:30001/Stockcount');

module.exports = {mongoose};