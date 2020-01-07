const express = require('express')
process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk')

//configure only for development, need to clean up for production
AWS.config.update({
  endpoint: "http://localhost:8000"
})

let router = express.Router()
let dbclient = new AWS.DynamoDB.DocumentClient()

router.get('/user/:id', (req, res) => {
	let params = {
		TableName: 'vendortest',
		IndexName: "reviewer",
		ExpressionAttributeValues: {
			':revid': req.params.id,
		},
		KeyConditionExpression: 'reviewer = :revid'
	}

	dbclient.query(params, (err, data) => {
		if(err) {
			console.log(err)
			return res.send({success: false, msg: 'server error'})
		}
		console.log(data)
		let items = []
		for(i = 0; i < data.Items.length; i++) {
			items.push(data.Items[i].info)
		}
		return res.send({success: true, reviews: items})
	})

})

module.exports = router
