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

	// var return_val = {}

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

	console.log("the users.json file is: " + rawdata)

	let users = JSON.parse(rawdata)

	console.log("the users.json file is: " + rawdata)

	// for (var i=0; i < users.length; i++) {
	// 	if (users[i].transactionReference == transactionReference) {
	// 		if (users[i].status == "pending") {
	// 			return_val.status = "PENDING"
	// 		}
	// 		else {
	// 			return_val.status = users[i].status
	// 			return_val.data = users[i].data
	// 		}

	// 		res.json(return_val)

	// 		break
	// 	}
	// }

	// console.log("could not find the user's transactionReference")

	// return_val.status = "NO_USER"

	// res.json(return_val)

	// var i = 0

	var get_status = new Promise(function(resolve, reject) {

		var return_val = {}

		for (var i=0; i < users.length; i++) {

			console.log("comparing " + users[i].transactionReference + " to " + transactionReference)

			if (users[i].transactionReference == transactionReference) {

				console.log("there is a match.")

				if (users[i].status == "pending") {
					return_val.status = "PENDING"
				}
				else {
					return_val.status = users[i].status
					return_val.data = users[i].data
				}

				resolve(return_val)
				// res.json(return_val)

				// break
			}
		}

		// console.log("could not find user.")

		// return_val.status = "NO_USER"

		// reject(return_val)
	});

	get_status.then(function(obj) {

		res.json(obj)

		console.dir(obj);
	  // expected output: "foo"
	}).catch(function(obj) {
		res.json(obj)

		console.dir(obj);
	});

	// console.log(promise2);
	// expected output: [object Promise]



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

	var transactionReference = req.body.jumioIdScanReference

	console.log("the first name is: " + firstName)

	res.send("OK")

	var id_status = JSON.parse(req.body.identityVerification)

	console.log("the value for similarity is: " + id_status.similarity)

	let rawdata = fs.readFileSync('users.json')

	let users = JSON.parse(rawdata)

	console.log("******* got the callback, looking for user...")

	var get_status = new Promise(function(resolve, reject) {

		var return_val = {}

		for (var i=0; i < users.length; i++) {

			console.log("comparing " + users[i].transactionReference + " to " + transactionReference)

			if (users[i].transactionReference == transactionReference) {

				console.log("there is a match.")

				users[i].data = req.body

				if (id_status.similarity == "MATCH" && id_status.validity) {
					console.log("there was an id match with the JSON parsing.")
					users[i].status = "IDENTITY_VERIFIED"
				}
				else {
					console.log("Could not match ID with selfie.")
					users[i].status = "IDENTITY_NOT_VERIFIED"
				}

				resolve(users)
			}
		}

		// console.log("could not find user.")

		// return_val.status = "NO_USER"

		// reject(return_val)
	});

	get_status.then(function(obj) {

		fs.writeFileSync('users.json', JSON.stringify(obj))

		console.dir(obj);
	  // expected output: "foo"
	}).catch(function(obj) {

		console.dir(obj);
	});





	// for (var i=0; i < users.length; i++) {
	// 	if (users[i].transactionReference == transactionReference) {

	// 		users[i].data = req.body

	// 		if (id_status.similarity == "MATCH" && id_status.validity) {
	// 			console.log("there was an id match with the JSON parsing.")
	// 			users[i].status = "IDENTITY_VERIFIED"
	// 		}
	// 		else {
	// 			console.log("Could not match ID with selfie.")
	// 			users[i].status = "IDENTITY_NOT_VERIFIED"
	// 		}

	// 		fs.writeFileSync('users.json', JSON.stringify(users))

	// 		break
	// 	}
	// }
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

	new_user.transactionReference = req.body.transactionReference
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
