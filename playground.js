 const {MongoClient, ObjectId} = require('mongodb');
var {mongoose} = require('./db/mongoose');
var {User} = require('./models/user');
var {Product} = require('./models/product');

if(typeof require !== 'undefined') XLSX = require('xlsx');

var workbook = XLSX.readFile(__dirname + '/imports/data_products_all.xls');
var first_sheet_name = workbook.SheetNames[0];
var address_of_cell = 'A1';
var worksheet = workbook.Sheets[first_sheet_name];
camelize_header_row(worksheet);
var dataForDb = XLSX.utils.sheet_to_json(worksheet);

//for the first row of the sheet: get all cells into an array, then camelCase all values and write them back

function camelize_header_row(sheet) {
    var headers = [];
    var range = XLSX.utils.decode_range(sheet['!ref']);
    var C, R = range.s.r; /* start in the first row */
    /* walk every column in the range */
    for(C = range.s.c; C <= range.e.c; ++C) {
        var cell = sheet[XLSX.utils.encode_cell({c:C, r:R})] /* find the cell in the first row */
        var cell2 = cell;

        var hdr = "UNKNOWN " + C; // <-- replace with your desired default 
        cell2.r = camelize(cell.r);
        cell2.v = camelize(cell.v);
        cell2.w = camelize(cell.w);
        if(cell && cell.t) hdr = XLSX.utils.format_cell(cell);
        headers.push(camelize(hdr));
    }
    return headers;

}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function(match, index) {
    if (+match === 0) return ""; // or if (/\s+/.test(match)) for white spaces
    return index == 0 ? match.toLowerCase() : match.toUpperCase();
  });
}

 MongoClient.connect('mongodb://localhost:30001/Stockcount', (err, db) => {
	if (err) {
		return console.log('Unable to connect to DB');
	};
	console.log('Connection to MongoDB successful');
	var i = 1

	dataForDb.forEach((item) => {	

		// split the old codes into an array
		var str = item.oldCode;
		var array = str.split("|").map(function(item) {
			  return item.trim();
			});

		// then for each of the old codes, look in the db, if this now 'old code' fomerly was existing as code
		for (var i = 0, len = array.length; i < len; i++) {
			db.collection('products').replaceOne(
				{code: array[i]},
				item,
				{upsert: false}
			);
		}
		// now check if the code of the current item is in the database - if so, replace the item

		db.collection('products').replaceOne(
			{code: item.code},
			item,
			{upsert: true}
		);
		console.log('current item:', item.code);

	});
	console.log('Done');

	

	db.close();
});