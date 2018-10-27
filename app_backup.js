// Okta + Jumio integration

////////////////////////////////////////////////////

require('dotenv').config()

const bodyParser = require("body-parser")

const express = require('express')

var session = require('express-session')

var fs = require('fs');

var request = require('request');

var url = require('url');

// var jsonParser = bodyParser.json()

///////////////////////////////////////////////////

// SET UP WEB SERVER
const app = express();

var port = process.env.PORT || 5459;

app.use(express.static('public'))
// app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.use(session({ secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.listen(port, function () {
	console.log('App listening on port ' + port + '...');
})

// create application/x-www-form-urlencoded parser
// var urlencodedParser = bodyParser.urlencoded({ extended: false });

//////////////////////////////////////////////////


//////////////////////////////////////////////////

// HOME PAGE
app.get('/', function (req, res) {
	fs.readFile('html/index.html', (err, data) => {
		if (err) {
			console.log("error reading the index.html file")
		}

		var page = data.toString()

		page = page.replace(/{{baseUrl}}/g, "https://" + process.env.OKTA_TENANT)
		page = page.replace(/{{clientId}}/g, process.env.OKTA_CLIENT_ID)
		page = page.replace(/{{OKTA_MFA_CLIENT_ID}}/g, process.env.OKTA_MFA_CLIENT_ID)
		page = page.replace(/{{OKTA_REDIRECT_URI}}/g, process.env.OKTA_REDIRECT_URI)
		page = page.replace(/{{logo}}/g, process.env.OKTA_LOGO)

		res.send(page)
	})
})

app.post('/callback', function (req, res) {

	console.log("the callback from netverify is: ")

	console.dir(req.body)
})

app.get('/userResults', function (req, res) {

  var queryData = url.parse(req.url, true).query

  console.log("the query coming back from netverify is: ")

  console.dir(queryData)

  if (queryData.transactionStatus == "SUCCESS") {

  	console.log("the netverify transaction finished.")

  	console.log("the transaction id is: " + queryData.transactionReference)

  	demo()

  	req.session.transactionReference = queryData.transactionReference

	var options = {
	  method: 'GET',
	  url: 'https://netverify.com/api/netverify/v2/scans/' + queryData.transactionReference + '/data',
	  headers: {
	    'Cache-Control': 'no-cache',
	    Authorization: 'Basic ZmRhYjg3Y2YtZjE0Ni00MGZjLTlkMDgtNjc1Yzc2NjhlNDg2OjYwdTRtQVNnZTJyOFYxYjVlS2VUR0pMaDUweXJkVnZj',
	    Accept: 'application/json',
	    'User-Agent': 'okta jumiotest/1.0.0'
	  }
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);

	  console.log("the status of the scan is: " + body.status)

	  body = JSON.parse(body)

	  // for (i=0; i < 10; i++) {
	  // 	if (body.status == "DONE") {}

// function sleep(ms) {
//   return new Promise(resolve => setTimeout(resolve, ms));
// }

// async function demo() {
//   console.log('Taking a break...');
//   await sleep(2000);
//   console.log('Two seconds later');
// }

// demo();

	  console.log("the first name is: " + body.document.firstName)
	  console.log("the last name is: " + body.document.lastName)

	  fs.readFile('./html/register.html', (err, data) => {
		if (err) {
			console.log("error reading the register.html file")
		}

		var page = data.toString()

		page = page.replace(/{{fname}}/g, body.document.firstName)
		page = page.replace(/{{lname}}/g, body.document.lastName)

		res.send(page)
		})
	});

	var options = {
	  method: 'GET',
	  url: 'https://netverify.com/api/netverify/v2/scans/' + queryData.transactionReference + "/data",
	  headers: {
	    'Cache-Control': 'no-cache',
	    Authorization: 'Basic ZmRhYjg3Y2YtZjE0Ni00MGZjLTlkMDgtNjc1Yzc2NjhlNDg2OjYwdTRtQVNnZTJyOFYxYjVlS2VUR0pMaDUweXJkVnZj',
	    Accept: 'application/json',
	    'User-Agent': 'okta jumiotest/1.0.0'
	  }
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);

	  body = JSON.parse(body)

	  console.log("the first name is: " + body.document.firstName)
	  console.log("the last name is: " + body.document.lastName)

	  fs.readFile('./html/register.html', (err, data) => {
		if (err) {
			console.log("error reading the register.html file")
		}

		var page = data.toString()

		page = page.replace(/{{fname}}/g, body.document.firstName)
		page = page.replace(/{{lname}}/g, body.document.lastName)

		res.send(page)
		})
	});

    // user told us their name in the GET request, ex: http://host:8000/?name=Tom
    // res.end('Hello ' + queryData.transactionReference + '\n');

  } else {
    res.end("Sorry, something went wrong with that transaction\n");
  }
})

app.post('/register', function (req, res) {

	req.session.email = req.body.email

	console.log("the /reg email is: " + req.body.email)

	var options = {
		method: 'POST',
	  url: 'https://okta-jumio.oktapreview.com/api/v1/users',
	  qs: { activate: 'true' },
	  headers: {
	     'Cache-Control': 'no-cache',
	     Authorization: 'SSWS 00yigkWqw6xJo1IakrJt2CrvYEWbz6gMw1hq4zZJhp',
	     'Content-Type': 'application/json',
	     Accept: 'application/json'
	  },
	  body: {
	  	profile: {
	  		firstName: req.body.fname,
	        lastName: req.body.lname,
	        email: req.body.email,
	        login: req.body.email,
	        jumio_transaction_id: req.session.transactionReference
	    }
	  },
	  json: true };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  if (body.errorCode) {
	  	res.send("sorry, an error occurred with Okta registration: " + body.errorCauses[0].errorSummary)
	  	return
	  }

	  console.log(body)

	  console.log("the user id is: " + body.id)

		var request = require("request");

		var options = {
			method: 'POST',
			url: 'https://okta-jumio.oktapreview.com/api/v1/users/' + body.id + '/lifecycle/activate',
			qs: { sendEmail: 'true' },
			headers: {
				'Cache-Control': 'no-cache',
				Authorization: 'SSWS 00yigkWqw6xJo1IakrJt2CrvYEWbz6gMw1hq4zZJhp',
				Accept: 'application/json',
				'Content-Type': 'application/json'
			}
		};

		request(options, function (error, response, body) {
		  if (error) throw new Error(error);

		  console.log(body);

		  res.redirect('/thank_you')

		});
	});
})

app.get('/thank_you', function (req, res) {
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
	     locale: 'en' },
	  json: true };

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);

	  console.log("the redirect url is: " + body.redirectUrl)

	  res.redirect(body.redirectUrl);

	});
})

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function demo() {
  console.log('Taking a break...');
  await sleep(5000);
  console.log('Two seconds later');
}