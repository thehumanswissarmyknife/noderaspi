const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Product} = require('./../models/product');

const products = [
	{
		code: 'DINJCLOX5VV',
		description: 'CLOXACILLINE sodique, éq. 500 mg base, poudre, fl. IV',
		batchNumberMandatory: true,
		oldCode: ''
	},
	{
		code: 'DORAIBUP4T-',
		description: 'IBUPROFEN, 400mg, tab',
		batchNumberMandatory: true,
		oldCode: ''
	},
	{
		code: 'DINFRINL1FBF1',
		description: 'RINGER lactate, 1 l, poche souple, sans PVC',
		batchNumberMandatory: true,
		oldCode: ''
	},
	{
		code: 'CWATBEDND0P22',
		description: 'MOSQUITO NET deltamethrin (Permanet 2.0) 2 persons',
		batchNumberMandatory: false,
		oldCode: 'CWATBEDN-----'
	}]

beforeEach((done) => {
	Product.remove({}).then(() => {
		return Product.insertMany(products);
	}).then(() => done());
});

describe('POST /products', () => {
	it('should create a new product', (done) => {
		var code = 'DORAPARA5T-';
		var description = 'PARACETAMOL, meines auch deines';
		var oldCode = '';
		var batchNumberMandatory = false;

		request(app)
			.post('/products')
			.send({code: code, description: description, oldCode: oldCode, batchNumberMandatory: batchNumberMandatory})
			.expect(200)
			.expect((res) => {
				expect(res.body.code).toBe(code);
				expect(res.body.description).toBe(description);
				expect(res.body.oldCode).toBe(oldCode);
				expect(res.body.batchNumberMandatory).toBe(batchNumberMandatory);
			})
			.end((err, res) => {
				if(err){
					return done(err);
				}
				Product.find({code}).then((products) => {
					expect(products.length).toBe(1);
					expect(products[0].code).toBe(code);
					done();
				}).catch((e) => done(e));
			});
	});

	it('should not create a product with a short code', (done) => {
		var code = 'DORapara5t';

		request(app)
			.post('/products')
			.send({code: code, description: '', oldCode: ''})
			.expect(400)
			.end((err, res) => {
				if(err){
					return done(err)
				}
			Product.find().then((products) => {
				expect(products.length).toBe(4);
				done();
			}).catch((e) => done(e));
		});	
	});
});

describe('GET /products', () => {
	it('should get 4 items back', (done) => {
		request(app)
			.get('/products')
			.expect(200)
			.expect((res) => {
				expect(res.body.products.length).toBe(4);
			})
			.end(done);
	});
});