// Okta + Jumio integration

////////////////////////////////////////////////////

require('dotenv').config()

const bodyParser = require("body-parser")

const express = require('express')

var fs = require('fs')

var request = require('request')

var session = require('express-session')

var url = require('url')

///////////////////////////////////////////////////

// SET UP WEB SERVER
const app = express();

var port = process.env.PORT

app.use(express.static('public'))

app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.listen(port, function () {
	console.log('App listening on port ' + port + '...');
})

//////////////////////////////////////////////////

app.get('/status', function (req, res) {

	var queryData = url.parse(req.url, true).query

	if (queryData.transactionReference === undefined) {
		return_val.status = "TS_UNDEFINED_TRANSACTION_REFERENCE"
		res.json(return_val)
		return
	}

	console.dir(queryData)

	console.log("the transactionReference from the client is: " + queryData.transactionReference)

	var transactionReference = queryData.transactionReference

	var get_status = new Promise(function(resolve, reject) {

		fs.readFile('users.json', function read(err, rawdata) {
			if (err) {
				throw err;
			}

			console.log("the users.json file is: " + rawdata)

			var users = JSON.parse(rawdata)

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
				}
			}
		});
	});

	get_status.then(function(obj) {
		res.json(obj)

		console.dir(obj)

	}).catch(function(obj) {
		res.json(obj)

		console.dir(obj)
	})
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

					var options = {
						method: 'POST',
						url: process.env.OKTA_TENANT + '/api/v1/users',
						qs: { activate: 'true' },
						headers: {
							'Cache-Control': 'no-cache',
							Authorization: 'SSWS ' + process.env.OKTA_API_TOKEN,
							'Content-Type': 'application/json',
							Accept: 'application/json'
						},
						body: {
							profile: {
								firstName: users[i].fname,
								lastName: users[i].lname,
								email: users[i].email,
								login: users[i].email,
								jumio_transaction_id: transactionReference
							}
						},
						json: true
					}

					request(options, function (error, response, body) {
						if (error) throw new Error(error)

						if (body.errorCode) {
							users[i].status = "REGISTRATION_ERROR"
							users[i].status .= body.errorCauses[0].errorSummary

							// res.send("sorry, an error occurred with Okta registration: " + body.errorCauses[0].errorSummary)
							// return
						}

						console.log(body)

						console.log("the user id is: " + body.id)
					})
				}
				else {
					console.log("Could not match ID with selfie.")
					users[i].status = "IDENTITY_NOT_VERIFIED"
				}
				resolve(users)
			}
		}
	})

	get_status.then(function(obj) {

		fs.writeFile("users.json", JSON.stringify(obj), 'utf8', function (err) {
			if (err) {
				return console.log(err);
			}

			console.log("The file was saved!")
		})
	}).catch(function(obj) {

		console.dir(obj)
	})
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

app.post('/go', function (req, res) {

	var options = {
		method: 'POST',
		url: 'https://netverify.com/api/v4/initiate',
		headers: {
			'Cache-Control': 'no-cache',
			Authorization: 'Basic ' + process.env.JUMIO_AUTH_STRING,
			'User-Agent': 'Okta',
			'Content-Type': 'application/json',
			Accept: 'application/json'
		},
		body: {
			customerInternalReference: 'okta_transaction_12345',
			userReference: 'user_1234',
			successUrl: process.env.MY_APP + '/userResults',
			errorUrl: process.env.MY_APP + '/error',
			callbackUrl: process.env.MY_APP + '/callback',
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
