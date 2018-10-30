// Okta + Jumio integration

////////////////////////////////////////////////////

require('dotenv').config()

const bodyParser = require("body-parser")

const express = require('express')

var session = require('express-session')

var fs = require('fs');

var request = require('request');

var url = require('url')

///////////////////////////////////////////////////

// SET UP WEB SERVER
const app = express();

var port = process.env.PORT || 5459;

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.listen(port, function () {
	console.log('App listening on port ' + port + '...');
})

//////////////////////////////////////////////////


//////////////////////////////////////////////////

app.get('/status', function (req, res) {

	var return_val = {}

	var queryData = url.parse(req.url, true).query

	if (queryData.transactionReference === undefined) {
		return_val.status = "TS_UNDEFINED_TRANSACTION_REFERENCE"
		res.json(return_val)
		return
	}

	console.dir(queryData)

	console.log("the transactionReference from the client is: " + queryData.transactionReference)

	var transactionReference = queryData.transactionReference

	let rawdata = fs.readFileSync('users.json')

	let users = JSON.parse(rawdata)

	for (var i=0; i < users.length; i++) {
		if (users[i].transactionReference == transactionReference) {
			if (users[i].status == "pending") {
				return_val.status == "PENDING"

				res.json(return_val)
			}
			else {
				return_val.status = users[i].status
				return_val.data = users[i].data
			}
			break
		}
	}

	// console.log("making a request to the /scans endpoint...")

	// var options = {
	// 	method: 'GET',
	// 	url: 'https://netverify.com/api/netverify/v2/scans/' + transactionReference,
	// 	headers: {
	// 		'Cache-Control': 'no-cache',
	// 		Authorization: 'Basic ZmRhYjg3Y2YtZjE0Ni00MGZjLTlkMDgtNjc1Yzc2NjhlNDg2OjYwdTRtQVNnZTJyOFYxYjVlS2VUR0pMaDUweXJkVnZj',
	// 		Accept: 'application/json',
	// 		'User-Agent': 'okta jumiotest/1.0.0'
	// 	}
	// }

	// request(options, function (error, response, body) {

	// 	if (error) throw new Error(error);

	// 	console.log("received a response from the /scans endpoint:")

	// 	// var return_val = {}

	// 	console.log(body)

	// 	body = JSON.parse(body)

	// 	if (body.status === "DONE") {

	// 		var options = {
	// 			method: 'GET',
	// 			url: 'https://netverify.com/api/netverify/v2/scans/' + transactionReference + '/data',
	// 			headers: {
	// 				'Cache-Control': 'no-cache',
	// 				Authorization: 'Basic ZmRhYjg3Y2YtZjE0Ni00MGZjLTlkMDgtNjc1Yzc2NjhlNDg2OjYwdTRtQVNnZTJyOFYxYjVlS2VUR0pMaDUweXJkVnZj',
	// 				Accept: 'application/json',
	// 				'User-Agent': 'okta jumiotest/1.0.0'
	// 			}
	// 		}

	// 		request(options, function (error, response, body) {
	// 			if (error) throw new Error(error);

	// 			console.log(body)

	// 			obj = JSON.parse(body)

	// 			doc_status = obj.document.status

	// 			if (obj.document.status === "APPROVED_VERIFIED") {

	// 				return_val.status = "APPROVED_VERIFIED"

	// 				return_val.data = obj

	// 				console.log("the first name is: " + obj.document.firstName)
	// 				console.log("the last name is: " + obj.document.lastName)

	// 				res.json(return_val)

	// 				let rawdata = fs.readFileSync('users.json')

	// 				let users = JSON.parse(rawdata)

	// 				var userID
	// 				var i

	// 				for (i=0; i < users.length; i++) {
	// 					if (users[i].transactionReference == transactionReference) {
	// 						userID = users[i].userID
	// 						break
	// 					}
	// 				}

	// 				var options = {
	// 					method: 'POST',
	// 					url: 'https://okta-jumio.oktapreview.com/api/v1/users/' + userID + '/lifecycle/activate',
	// 					qs: { sendEmail: 'true' },
	// 					headers: {
	// 						'Cache-Control': 'no-cache',
	// 						Authorization: 'SSWS 00yigkWqw6xJo1IakrJt2CrvYEWbz6gMw1hq4zZJhp',
	// 						Accept: 'application/json',
	// 						'Content-Type': 'application/json'
	// 					}
	// 				};

	// 				request(options, function (error, response, body) {
	// 					if (error) throw new Error(error);

	// 					console.log(body)
	// 				});
	// 			}
	// 			else {
	// 				return_val.status = body.status
	// 				res.json(return_val)
	// 			}
	// 		})
	// 	}
	// 	else {
	// 		return_val.status = body.status
	// 		res.json(return_val)
	// 	}
	// })
})

app.post('/callback', function (req, res) {

	console.log("the callback from netverify is: ")

	console.dir(req.body)

	var firstName = req.body.idFirstName

	console.log("the first name is: " + firstName)

	res.send("OK")





	
})

app.get('/userResults', function (req, res) {

	var queryData = url.parse(req.url, true).query

	console.log("the query coming back from netverify is: ")

	console.dir(queryData)

	if (queryData.transactionStatus == "SUCCESS") {

		fs.readFile('html/register.html', (err, data) => {
			if (err) {
				console.log("error reading the register.html file")
			}

			var page = data.toString()

			res.send(page)
		})
	}
})

app.post('/register', function (req, res) {

	req.session.email = req.body.email

	console.log("the /reg email is: " + req.body.email)

	console.log("the transactionReference is: " + req.body.transactionReference)

	let rawdata = fs.readFileSync('users.json')

	let users = JSON.parse(rawdata)

	var new_user = {}

	new_user.transactionReference = req.session.transactionReference
	new_user.fname = req.body.fname
	new_user.lname = req.body.lname
	new_user.email = req.body.email
	new_user.status = "pending"

	users.push(new_user)

	fs.writeFileSync('users.json', JSON.stringify(users))

	fs.readFile('html/thank_you.html', (err, data) => {
		if (err) {
			console.log("error reading the thank_you.html file")
		}

		var page = data.toString()

		page = page.replace(/{{email}}/g, req.session.email)

		res.send(page)
	})
})

// app.get('/thank_you', function (req, res) {

// 	fs.readFile('html/thank_you.html', (err, data) => {
// 		if (err) {
// 			console.log("error reading the thank_you.html file")
// 		}

// 		var page = data.toString()

// 		page = page.replace(/{{email}}/g, req.session.email)

// 		res.send(page)
// 	})
// })

app.post('/go', function (req, res) {

	var options = {
		method: 'POST',
		url: 'https://netverify.com/api/v4/initiate',
		headers: {
			'Cache-Control': 'no-cache',
			Authorization: 'Basic ZmRhYjg3Y2YtZjE0Ni00MGZjLTlkMDgtNjc1Yzc2NjhlNDg2OjYwdTRtQVNnZTJyOFYxYjVlS2VUR0pMaDUweXJkVnZj',
			'User-Agent': 'Okta',
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: {
			customerInternalReference: 'okta_transaction_12345',
			userReference: 'user_1234',
			successUrl: 'https://okta-jumio.herokuapp.com/userResults',
			errorUrl: 'https://okta-jumio.herokuapp.com/error',
			callbackUrl: 'https://okta-jumio.herokuapp.com/callback',
			reportingCriteria: 'myReport1234',
			workflowId: 200,
			presets: [ { index: 1, country: 'USA', type: 'DRIVING_LICENSE' } ],
			locale: 'en'
		},
		json: true
	}

	request(options, function (error, response, body) {
		if (error) throw new Error(error);

		console.log(body);

		console.log("the redirect url is: " + body.redirectUrl)

		res.redirect(body.redirectUrl)
	})
})
