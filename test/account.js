process.env.NODE_ENV = 'test'

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../app.js')
let should = chai.should()

chai.use(chaiHttp)

//need to clear local instance of dynamodb before running the test a secoond time, otherwise the account creation tests will fail
//because the account already exists from being created when running the previous test

describe('fucking everything', () => {
	it('missing display name', (done) => {
		let body = {
			displayName: '',
			email: 'abc@b.c',
			password: 'abc123'
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Field not supplied')
		done()
		})
	})

	it('missing email', (done) => {
		let body = {
			displayName: 'bob21',
			email: '',
			password: 'abc123'
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Field not supplied')
		done()
		})
	})

	it('missing password', (done) => {
		let body = {
			displayName: 'bob21',
			email: 'abc@b.c',
			password: ''
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Field not supplied')
		done()
		})
	})

	it('wrong display name type', (done) => {
		let body = {
			displayName: 654,
			email: 'abc@b.c',
			password: 'abc123'
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('wrong email type', (done) => {
		let body = {
			displayName: 'asd',
			email: true,
			password: 'abc123'
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('wrong password type', (done) => {
		let body = {
			displayName: 'asd',
			email: 'abc@b.c',
			password: 5595
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('good account, should create', (done) => {
		let body = {
			displayName: 'asd',
			email: 'abc@b.c',
			password: 'asdfaerg'
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('msg').eql('Account created')
		done()
		})
	})

	it('attemp to create the same account again, should fail', (done) => {
		let body = {
			displayName: 'asd',
			email: 'abc@b.c',
			password: 'asdfaerg'
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Account already registered to this email')
		done()
		})
	})

	it('another good account, for later', (done) => {
		let body = {
			displayName: 'asd',
			email: 'bob@bob.com',
			password: 'huhuhu'
		}
		chai.request(server)
		.post('/register')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('msg').eql('Account created')
		done()
		})
	})

	it('attemp to login, missing email', (done) => {
		let body = {
			email: null,
			password: 'asdfaerg'
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Input field missing')
		done()
		})
	})

	it('attemp to login, missing password', (done) => {
		let body = {
			email: 'mjhbkuy',
			password: ''
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Input field missing')
		done()
		})
	})

	it('attemp to login, email wrong type', (done) => {
		let body = {
			email: 585858,
			password: 'huhuhuhu'
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('attemp to login, passwrod wrong type', (done) => {
		let body = {
			email: 'wefwef',
			password: 59595
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('attemp to login, email wrong type', (done) => {
		let body = {
			email: 585858,
			password: 'huhuhuhu'
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Bad fields supplied')
		done()
		})
	})

	it('attemp to login, account doesnt exist', (done) => {
		let body = {
			email: '585858',
			password: 'huhuhuhu'
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('No account associated with this email')
		done()
		})
	})

	it('attemp to login, email exists, pass wrong', (done) => {
		let body = {
			email: 'bob@bob.com',
			password: '3216513'
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(false)
			res.body.should.have.property('msg').eql('Username or password incorrect')
		done()
		})
	})

	it('attemp to login, should login', (done) => {
		let body = {
			email: 'abc@b.c',
			password: 'asdfaerg'
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('msg').eql('Successful login')
		done()
		})
	})

	it('attemp to login, should login', (done) => {
		let body = {
			email: 'bob@bob.com',
			password: 'huhuhu'
		}
		chai.request(server)
		.post('/login')
		.send(body)
		.end((err, res) => {
			res.should.have.status(200)
			res.body.should.be.a('object')
			res.body.should.have.property('success').eql(true)
			res.body.should.have.property('msg').eql('Successful login')
		done()
		})
	})
})
