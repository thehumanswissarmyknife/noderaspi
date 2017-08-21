var leven = require('leven');

var array = ['18299302', '18299302/1', 'IB299302', '1829930/2', 'Pieter'];
var mutter = '18299302';

var {Batch} = require('./models/batch');
var {ObjectID} = require('mongodb');
var {mongoose} = require('./db/mongoose');

// for (var i = 0, len = array.length; i < len; i++) {
// 	console.log(`Master: ${mutter}, compared to ${array[i]} has a leven index off ${array[i].length/leven(mutter, array[i])}`);
// }

FuzzyBatches(mutter, array);

function FuzzyBatches(array, batch) {

	var fuzzedBatches = [];
	var compBatch = batch;
	Batch.find({
		productCode: 'DORAPARA5T-',
	}).then((batches) => {
		array.push(batches);
	}, (e) => {
		return fuzzedBatches;
	});

	for (var i = 0, len = array.length; i<len; i++) {
		if (compBatch.length/leven(compBatch, array[i])>4) {
			fuzzedBatches.push(array[i]);
		};
	}
	console.log(fuzzedBatches);
	return fuzzedBatches;
}