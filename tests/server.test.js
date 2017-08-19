const expect = require('expect');
const request = require('supertest');

const {app} = require('./../server');
const {Product} = require('./../models/product');

beforeEach((done) => {
	Product.remove({}).then(() => done());
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
				Product.find().then((products) => {
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
				expect(products.length).toBe(0);
				done();
			}).catch((e) => done(e));
		});	
	});
});