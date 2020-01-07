const crypto = require('crypto')
const express = require('express')
process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk')
const bcrypt = require('bcrypt')

//configure aws, just for testing, need to get rid of for deployment
AWS.config.update({
  endpoint: "http://localhost:8000"
})

const RESET_SECRET = '9&&84AyYlMaOAy*@$^(ylIen65fyt16SwRoTiuhE76yigyktHiS'

let router = express.Router()
let dbclient = new AWS.DynamoDB.DocumentClient()
let jwt = require('jsonwebtoken')

router.post('/reset', (req, res) => {
	//because we inserted token as a string with a single space when creating the account, need to make sure that all of the newly created
	//accounts dont'a have their password reset when token of ' ' is passed in
	//necessary because token is being used as a secondary index and cannot create with an entry in dynamodb with an attribute value undefined
	if(req.body.token === ' ') {
		return res.send({success: false, msg: 'invalid token'})
	}

	if(!req.body.token || !req.body.password) {
		return res.send({success: false, msg: 'missing info'})
	}

	if(typeof req.body.token !== 'string' || typeof req.body.password !== 'string') {
		return res.send({success: false, msg: 'bad inputs'})
	}

	let email = req.body.email.toLowerCase()

	//fetch the token from the db
	let params = {
		TableName: "usertest",
		Key:{
	        "email": email,
			"type": "info"
	    }
	}

	dbclient.get(params, (err, data) => {
		if(err) {
			console.log(err)
			return res.send({success: false, msg: 'server error'})
		}

		if(!data.Item) {
			return res.send({success: false, msg: 'user does not exist'})
		}

		//need to make sure the token is still valid
		let now = Math.floor(Date.now() / 1000)
		if(data.Item.info.token !== req.body.token) {
			return res.send({success: false, msg: 'invalid token'})
		}

		if(data.Item.info.token_expiration > now) {
			return res.send({success: false, msg: 'expired token'})
		}

		//update password since the token is legit
		bcrypt.hash(req.body.password, 12, (err, passHash) => {
			if(err) {
				console.log(err)
				return res.send({success: false, msg: 'server error'})
			}

			//want to reset token back to ' ' because it has been used
			//if an attempt is made to reset password with just ' ', will be rejected on line 22
			let params = {
				TableName: "usertest",
				Key: {
					"email": email,
					"type": "info"
				},
				UpdateExpression: 'set info.password = :pw, info.token = :tok',
				ExpressionAttributeValues: {
					":pw": passHash,
					"tok": ' '
				},
				ReturnValues:"UPDATED_NEW"
			}

			dbclient.update(params, (err, data) => {
				if(err) {
					console.log(err)
					return res.send({success: false, msg: 'server error'})
				} else {
					console.log("data updated", JSON.stringify(data))
					return res.send({success: true, msg: 'password successfully reset'})

					/*
					need to add email stuff
					*/
				}


			})
		})
	})
})

router.post('/reqreset', (req, res) => {
	if(!req.body.email) {
		return res.send({success: false, msg: 'email required'})
	}

	if(typeof req.body.email !== 'string') {
		return res.send({success: false, msg: 'bad inputs'})
	}

	let email = req.body.email.toLowerCase()

	let params = {
		TableName: 'usertest',
		Key: {
			"email": email,
			"type": "info"
		}
	}

	//make sure that the email is related to an existing account
	dbclient.get(params, (err, data) => {
		if(err) {
			console.log(err)
			return res.send({success: false, msg: 'server error'})
		}

		//case where account doesnt exist
		if(!data.Item) {
			return res.send({success: false, msg: 'account does not exist'})
		}

		//create token from random bytes
		let token = crypto.randomBytes(256).toString('base64')
		console.log(token)

		//expiration in unix time
		let expiration = Math.floor(Date.now() / 1000)
		expiration = expiration + 3600

		//create update statement
		let params = {
			TableName: 'usertest',
			Key: {
				"email": email,
				"type": "info"
			},
			UpdateExpression: 'set #tk = :t, token_expiration = :expiration',
			ExpressionAttributeValues: {
				":t": token,
				":expiration": expiration
			},
			ExpressionAttributeNames: {
    			"#tk": "token"
  			},
			ReturnValues:"UPDATED_NEW"
		}

		//update the database with the token
		dbclient.update(params, (err, data) => {
			if(err) {
				console.log(err)
				return res.send({success: false, msg: 'server error'})
			} else {
				console.log("update successful, ", JSON.stringify(data))
				//send the email with the token link


				/*
					email stuff

				*/
				return res.send({success: true, msg: 'password reset email sent'})


			}
		})
	})


})

module.exports = router
