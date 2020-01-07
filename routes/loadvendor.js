const express = require('express')
process.env.AWS_SDK_LOAD_CONFIG = true;
const AWS = require('aws-sdk')
//again, this configuration just for testing, need to change for deployment
AWS.config.update({
  endpoint: "http://localhost:8000"
});

let router = express.Router()
let dbclient = new AWS.DynamoDB.DocumentClient()

router.get('/vendor/:id', (req, res) => {
	let vendor = req.params.id.toLowerCase()
	let params = {
		TableName: "vendortest",
		ExpressionAttributeValues: {
			':partitionkey': vendor,
			':sortkeyval': "vendor#"
		},
		ExpressionAttributeNames: { "#type": "type" },
		KeyConditionExpression: 'vendor = :partitionkey AND begins_with ( #type, :sortkeyval )',
	}

	dbclient.query(params, (err, data) => {
		if(err) {
			console.log(err)
			return res.status(500).send({success: false, msg: 'Server error'})
		}
		let exists = false
		console.log(data)
		let items = []
		for(i = 0; i < data.Items.length; i++) {
			//if the vendor does not exist than this will just return an empty item, need to check
			//that the vendor in fact does exist and remove the review from the list of reviews to be rendered
			if(data.Items[i].type === 'vendor#info') {
				exists = true
				continue
			}
			console.log(data.Items[i].info)
			items.push(data.Items[i].info)
		}
		return res.status(200).send({success: true, reviews: items, exists: exists})
	})
})

module.exports = router
