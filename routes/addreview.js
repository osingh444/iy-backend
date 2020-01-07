const express = require('express')
process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk')

let jwt = require('jsonwebtoken')

let router = express.Router()
let dbclient = new AWS.DynamoDB.DocumentClient()

const MAX_REVIEW_LEN = 5000

router.post('/addreview', (req, res) => {
	//check the inputs for null values and check the cookie for missing token
	if(!req.body.review|| !req.body.numStars|| !req.cookies.token1 || !req.body.vendor || !req.cookies.token2) {
		return res.status(200).send({success: false, msg: 'Input field missing'})
	}

	//make sure the number of stars is legit
	if(req.body.numStars > 5 || req.body.numStars < 0) {
		return res.status(200).send({success: false, msg: 'Invalid number of stars'})
	}

	//maybe do some length checking for the review
	if(req.body.review.length > MAX_REVIEW_LEN) {
		return res.status(200).send({success: false, msg: 'Maximum review length exceeded'})
	}

	//typecheck the values
	if(typeof req.body.review !== 'string' || typeof req.body.vendor !== 'string' || typeof req.body.numStars !== 'number') {
		return res.status(200).send({success: false, msg: 'Bad fields supplied'})
	}

	//first need to verify the token
	//change the secret for the production version and move to environment variable
	jwt.verify(req.cookies.token1 + req.cookies.token2, 'secret', (err, decodedToken) => {
		if(err) {
			console.log(err)
			return res.status(500).send({success: false, msg: 'Server error'})
		}

		//check if there has already been a review posted by this email address, if so want to reject it because
		//they can just edit their review instead
		console.log(decodedToken)
		let params = {
			TableName: "vendortest",
			ExpressionAttributeValues: {
				':partitionkey': req.body.vendor.toLowerCase(),
				':sortkeyval': "vendor#" + decodedToken.user.toLowerCase()
			},
			ExpressionAttributeNames: { "#type": "type" },
			KeyConditionExpression: 'vendor = :partitionkey AND #type = :sortkeyval',
		}

		dbclient.query(params, (err, data) => {
			if(err) {
				console.log(err)
				return res.status(500).send({success: false, msg: 'Server error'})
			}
			//case where a review has already been written, just want to return
			if(data.Count === 1) {
				return res.status(200).send({success: false, msg: 'User has already posted a review for this vendor'})
			} else {
				//otherwise, want to enter the review
				let today = new Date()
				today = today.toISOString().substring(0, 10)

				let review = {
					"vendor": req.body.vendor.toLowerCase(),
					"type": "vendor#" + decodedToken.user.toLowerCase(),
					"reviewer": decodedToken.id,
					"info": {
						"reviewerName": decodedToken.name.toLowerCase(),
						"numStars": req.body.numStars,
						"reviewText": req.body.review,
						"date": today.substring(5, 10) + '-' + today.substring(0, 4),
						"imgpath": "http://abc123.com",
						"visible": true
					}
				}

				params = {
					TableName: "vendortest",
					Item: review
				}

				dbclient.put(params, (err, data) => {
					if(err) {
						console.log(err)
						return res.status(500).send({success: false, msg: 'Server error'})
					}
					return res.status(200).send({success: true, msg: 'Review posted'})
				})
			}

		})
	})
})

module.exports = router
