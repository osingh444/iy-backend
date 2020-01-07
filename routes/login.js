const express = require('express')
process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')
let jwt = require('jsonwebtoken')

//configure aws, just for testing, need to get rid of for deployment
AWS.config.update({
  endpoint: "http://localhost:8000"
});

let router = express.Router()
let dbclient = new AWS.DynamoDB.DocumentClient()

router.post('/login', (req, res) => {
	console.log(req.body)
	if(!req.body.email || !req.body.password) {
		return res.status(200).send({success: false, msg: 'Input field missing'})
	}

	//perform typechecking, both types should be strings
	if(typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
		return res.status(200).send({success: false, msg: 'Bad fields supplied'})
	}

	//set params for fetching from db
	let params = {
	    TableName: 'usertest',
	    Key:{
	        "email": req.body.email.toLowerCase(),
			"type": "info"
	    }
	}
	//retrieve the user object from db
	dbclient.get(params, (err, data) => {
		if(err) {
			console.log(err)
			return res.status(500).send({success: false, msg: 'Server error'})
		}

		console.log(data)
		//if user does not exist, return without issuing the token
		if(!data.Item) {
			return res.status(200).send({success: false, msg: 'No account associated with this email'})
		}
		//compare the password with the hash from the db
		bcrypt.compare(req.body.password, data.Item.info.passHash, (err, result) => {
			if(err) {
				console.log(err)
				return res.status(500).send({success: false, msg: 'Server error'})
			}
			//if the password and the password hash match, want to return a token
			if(result === true) {
				//issue the token
				//select a different secret later and move it into an environment variable
				jwt.sign({user: req.body.email, id: data.Item.info.id, name: data.Item.info.displayName}, 'secret', (err, token) => {
					if(err) {
						console.log(err)
						return res.status(500).send({success: false, msg: 'Server error'})
					}
					//set token cookie for user once they're logged in
					res.cookie('token1', token.substring(0, 70), { maxAge: 60000000, domain: 'localhost', httpOnly: true})
					res.cookie('token2', token.substring(70), { maxAge: 60000000, domain: 'localhost', httpOnly: false})
					res.cookie('token_set', true, { maxAge: 60000000, domain: 'localhost', httpOnly: false})
					return res.status(200).send({success: true, msg: 'Successful login'})
				})
			} else {
				//result of password check was not true, return error message instead
				return res.status(200).send({success: false, msg:'Username or password incorrect'})
			}
		})
	})
})

module.exports = router
