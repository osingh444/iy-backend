const express = require('express')
let AWS = require('aws-sdk')
let dynamodb = new AWS.DynamoDB()

const cors = require('cors')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')

const app = express()
//import all of the routes
const register = require('./routes/register')
const login = require('./routes/login')
const addreview = require('./routes/addreview')
const loadvendor = require('./routes/loadvendor.js')
const resets = require('./routes/resetpassword.js')
const viewuser = require('./routes/viewuser.js')

app.use(bodyParser.json())
app.use(cookieParser())
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}))

//use the routes
app.use(register)
app.use(login)
app.use(addreview)
app.use(loadvendor)
app.use(resets)
app.use(viewuser)

app.listen(5000, () => {
	console.log('listening on 5000')
})

module.exports = app
