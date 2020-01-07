process.env.NODE_ENV = 'test'

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app.js')
let should = chai.should()

chai.use(chaiHttp)

//************IMPORTANT**************
//if the review writing tests are failing, the cookies need to be updated
//to update the cookies, login and use the cookies set by the server in this file
//additionally, the vendor tests need to be updated because they retrieve the date
//which is set depending on what day the review was written
//probably easier to test loadvendor visually using the react portion of the site, but tests
//DYNAMODB NEEDS TO BE RESET AFTER EACH TEST BECAUSE ONCE THE ACCOUNT IS CREATED AND REVIEWS ADDED, WILL
//NO LONGER BE ABLE TO ADD BECAUSE INTENDED BEHAVIOR IS TO RETURN FALSE ON USER POSTING 2 REVIEW TO SAME VENDOR
//HOPEFULLY THESE TESTS NEVER NEED TO BE RAN AGAIN
//===================================

describe('adding some vendors', () => {
	it('should fail, no name supplied', (done) => {
		let body = {
			name: ''
		}
		chai.request(server)
		.post('/addvendor')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('Add').eql(false)
			res.body.should.have.property('Msg').eql('No username provided')
		done()
		})
	})

	it('should fail, wrong type name supplied', (done) => {
		let body = {
			name: 5
		}
		chai.request(server)
		.post('/addvendor')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('Add').eql(false)
			res.body.should.have.property('Msg').eql('Invalid input')
		done()
		})
	})

	it('should fail, invalid ig name supplied', (done) => {
		let body = {
			name: 'wef..wefwe'
		}
		chai.request(server)
		.post('/addvendor')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('Add').eql(false)
			res.body.should.have.property('Msg').eql('Invalid instagram username supplied')
		done()
		})
	})

	//might need to update the name provided in the future if lamar jackson makes his ig private
	//dont need to test every respose from the cache server, seperate tests written in go for that
	it('should succeed, valid ig name supplied', (done) => {
		let body = {
			name: 'new_era8'
		}
		chai.request(server)
		.post('/addvendor')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('Add').eql(true)
			res.body.should.have.property('Msg').eql('Account added to site')
		done()
		})
	})

	it('should fail, repeat ig name supplied', (done) => {
		let body = {
			name: 'new_era8'
		}
		chai.request(server)
		.post('/addvendor')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('Add').eql(false)
			res.body.should.have.property('Msg').eql('Username has already been added')
		done()
		})
	})
})

describe('writing some reviews for the vendors', () => {
	it('should fail, number of stars below 0', (done) => {
		let body = {
			numStars: -1,
			review: 'asdaf',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Invalid number of stars')
		done()
		})
	})

	it('should fail, number of stars above 5', (done) => {
		let body = {
			numStars: 6,
			review: 'asdaf',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Invalid number of stars')
		done()
		})
	})

	it('should fail, missing numstars', (done) => {
		let body = {
			numStars: null,
			review: 'asdaf',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Input field missing')
		done()
		})
	})

	it('should fail, missing review', (done) => {
		let body = {
			numStars: 4,
			review: '',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Input field missing')
		done()
		})
	})

	it('should fail, missing vendor', (done) => {
		let body = {
			numStars: 4,
			review: 'asdaf',
			vendor: ''
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Input field missing')
		done()
		})
	})

	it('should fail, numstars wrong type', (done) => {
		let body = {
			numStars: '5',
			review: 'asdaf',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('should fail, review wrong type', (done) => {
		let body = {
			numStars: 5,
			review: true,
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('should fail, vendor wrong type', (done) => {
		let body = {
			numStars: 5,
			review: 'true',
			vendor: 999
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('should fail, review exceeds max length', (done) => {
		let body = {
			numStars: 5,
			review: `jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj
			jjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjj`,
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Maximum review length exceeded')
		done()
		})
	})

	it('should succeed', (done) => {
		let body = {
			numStars: 1,
			review: 'review 1',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('msg').eql('Review posted')
		done()
		})
	})

	it('should fail, duplicate review from same user', (done) => {
		let body = {
			numStars: 1,
			review: 'review 1',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiYXNkZkBnLmMiLCJpZCI6I;token2=jMyODU4MTQzLTQ2MmMtNTZiOS1hNmY0LTYyMmI4MTMyYWRmMyIsIm5hbWUiOiJib2IxIiwiaWF0IjoxNTc3NDU0MDk0fQ.z2xHgMJ_bU_oHCp5nUC21To-FVYeu2klqsZA2QJHnyk')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('User has already posted a review for this vendor')
		done()
		})
	})

	it('should succeed', (done) => {
		let body = {
			numStars: 2,
			review: 'review 2',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiZ2hnaEBnLmMiLCJpZCI6I;token2=jUyZmUwODliLWJhMzEtNTM1Mi04MmU3LThhZjhiMTgzNjg2MyIsIm5hbWUiOiJib2IyIiwiaWF0IjoxNTc3NDU0MjA4fQ.wKBi4PX1n5l7TwPS9ph9oKHOrgjC_w23EoZtPkAHMIc')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('msg').eql('Review posted')
		done()
		})
	})

	it('should succeed', (done) => {
		let body = {
			numStars: 3,
			review: 'review 3',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.set('Cookie', 'token1=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoieWhAYS5iIiwiaWQiOiI1N;token2=zM0ZTc1Mi04ODVjLTU3YTYtOWI4YS04ZjQ4ZjFhYTQyY2EiLCJuYW1lIjoiYm9iMyIsImlhdCI6MTU3NzQ1NDMwOH0.bFmEguMybqgK6K1ASXk9se1Q1-Bz5W4I7yUza2WaI_M')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('msg').eql('Review posted')
		done()
		})
	})

	it('should fail, missing cookies', (done) => {
		let body = {
			numStars: 1,
			review: 'review 1',
			vendor: 'new_era8'
		}
		chai.request(server)
		.post('/addreview')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Input field missing')
		done()
		})
	})
})

describe('retrieving those reviews', () => {
	it('should get all the reviews', (done) => {
		chai.request(server)
		.get('/vendor/new_era8')
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('reviews').eql([{
				date: '2019-12-27',
				numStars: 1,
				reviewerName: 'bob1',
				reviewText: 'review 1',
				imgpath: 'http://abc123.com'
			}, {
				date: '2019-12-27',
				numStars: 2,
				reviewerName: 'bob2',
				reviewText: 'review 2',
				imgpath: 'http://abc123.com'
			}, {
				date: '2019-12-27',
				numStars: 3,
				reviewerName: 'bob3',
				reviewText: 'review 3',
				imgpath: 'http://abc123.com'
			}])
			res.body.should.have.property('exists').eql(true)
		done()
		})
	})

	it('should get nothing because vendor doesnt exist', (done) => {
		chai.request(server)
		.get('/vendor/selivjsleifvj')
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('reviews').eql([])
			res.body.should.have.property('exists').eql(false)
		done()
		})
	})
})
