const {MongoClient, ObjectId} = require('mongodb');
if(typeof require !== 'undefined') XLSX = require('xlsx');

var workbook = XLSX.readFile(__dirname + '/imports/test.xml');
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





	dataForDb.forEach((item) => {	

		// first check, if the item is already in the db -> also check in the old codes!!!!
		var codeToFind = new RegExp(item.code);
		db.collection('Products').findOne({"oldCode": codeToFind}).then((doc) => {
			if (doc) {
				console.log("found it", JSON.stringify(doc, undefined, 2));
				db.collection('Products').updateOne({_id:doc._id}, {$set: {code: item.oldCode}});
				console.log("changed it", JSON.stringify(doc, undefined, 2));
			};
			
		}, (err) => {
			console.log("item not found");
		});

		db.collection('Products').findOne({"code": item.code}).then((doc) => {
			if (doc) {
				console.log('Item already in db, verifying content');
				//check all characteristics

				// if the item is in the db and no change has occured, create a log file with its name

				// if the item is in the db, but something (code, batchmanagement, etc) has changed, update the existing document!

			} else {
				// item is not in the db, so add it
				db.collection('Products').insertOne(item, (err, result) => {
				if(err) {
					return console.log('Unable to insert user', err);
				}
				});

			}
		}, (err) => {

		})

		

		

	});

	

	db.close();
});