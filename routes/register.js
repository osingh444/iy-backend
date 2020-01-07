const express = require('express')
process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')
const uuid = require('uuid/v5')

//configure aws, just for testing, need to get rid of for deployment
AWS.config.update({
  endpoint: "http://localhost:8000"
})

let router = express.Router()
let dbclient = new AWS.DynamoDB.DocumentClient()

router.post('/register', (req, res) => {
	console.log(req.body)

    if(!req.body.displayName || !req.body.email || !req.body.password) {
        return res.status(200).send({success: false, msg: 'Field not supplied'})
    }
	//perform typecheck
	if(typeof req.body.displayName !== 'string' || typeof req.body.email !== 'string' || typeof req.body.password !== 'string') {
		return res.status(200).send({success: false, msg: 'Bad fields supplied'})
	}

	let email = req.body.email.toLowerCase()

	//check for the existence of an account registered to that username already
	let checkparams = {
	    TableName: 'usertest',
	    Key:{
	        "email": email,
			"type": "info"
	    }
	}

	dbclient.get(checkparams, (err, data) => {
		if(err) {
			return res.status(500).send({success: false, msg: 'server error'})
		}

		console.log(data)
		//case where account doesnt exist
		if(!data.Item) {
			//hash and salt the password using bcrypt library
			bcrypt.hash(req.body.password, 12, (err, passHash) => {
				if(err) {
					console.log(err)
					return res.status(500).send({success: false, msg: 'server error'})
				}
				//create the uuid for the user
				let id = uuid(email, uuid.DNS)

				//construct the user object to contain the user data that will be inserted into db
				let user = {
					"email": email,
					"type": "info",
					"info": {
						"passHash": passHash,
						"displayName": req.body.displayName,
						"token": ' ',
						"token_expiration": 0,
						"id": id,
						"confirmed": false
					}

				}
				//construct the object for db insertion
				let params = {
				  TableName: "usertest",
				  Item: user
				}
				//insert into the database
				dbclient.put(params, (err, _) => {
					if(err) {
						console.log(err)
						return res.status(500).send({success: false, msg: 'Server error'})
					}
					// TODO: need to send email for confirmation
					return res.status(200).send({success: true, msg: 'Account created'})
				})
			})
		} else {
			//case where account already exists
			return res.status(200).send({success: false, msg: 'Account already registered to this email'})
		}
	})


})

module.exports = router
