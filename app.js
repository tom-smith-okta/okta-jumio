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

app.get('/callback', function (req, res) {

  var queryData = url.parse(req.url, true).query
  res.writeHead(200, {"Content-Type": "text/plain"});

// transactionReference=318cef4a-0a8c-45eb-bf54-330425fa9024

  if (queryData.transactionStatus == "SUCCESS") {

  	console.log("the netverify transaction was a success.")

  	console.log("the transaction id is: " + queryData.transactionReference)

	var options = {
	  method: 'GET',
	  url: 'https://netverify.com/api/netverify/v2/scans/' + queryData.transactionReference + "/data",
	  headers: {
	    'Cache-Control': 'no-cache',
	    Authorization: 'Basic ZmRhYjg3Y2YtZjE0Ni00MGZjLTlkMDgtNjc1Yzc2NjhlNDg2OjYwdTRtQVNnZTJyOFYxYjVlS2VUR0pMaDUweXJkVnZj',
	    Accept: 'application/json',
	    'User-Agent': 'Jumiotest jumiotest/1.0.0'
	  }
	};

	request(options, function (error, response, body) {
	  if (error) throw new Error(error);

	  console.log(body);

	  fs.readFile('html/register.html', (err, data) => {
		if (err) {
			console.log("error reading the index.html file")
		}

		var page = data.toString()

		page = page.replace(/{{fname}}/g, body.firstName)
		page = page.replace(/{{lname}}/g, body.lastName)

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

	console.log(req.body.email)

	var options = { method: 'POST',
	  url: 'https://netverify.com/api/v4/initiate',
	  headers: 
	   { 'Postman-Token': '48463976-124c-4450-9337-73c5eb96df59',
	     'Cache-Control': 'no-cache',
	     Authorization: 'Basic ZmRhYjg3Y2YtZjE0Ni00MGZjLTlkMDgtNjc1Yzc2NjhlNDg2OjYwdTRtQVNnZTJyOFYxYjVlS2VUR0pMaDUweXJkVnZj',
	     'User-Agent': 'Okta',
	     'Content-Type': 'application/json',
	     Accept: 'application/json' },
	  body: 
	   { customerInternalReference: 'okta_transaction_12345',
	     userReference: 'user_1234',
	     successUrl: 'https://okta-jumio.herokuapp.com/callback',
	     errorUrl: 'https://okta-jumio.herokuapp.com/',
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

app.get('/checkAsset', function (req, res) {

	var assetID = req.query.assetID

	console.log("the assetID is: " + assetID)

	// perform a check here to see if the asset id requires MFA.
	// for this demo we are going to assume "yes"

	var state = "assetID_" + assetID

	var claims = {
		"iss": process.env.OKTA_MFA_CLIENT_ID,
		"exp": null,
		"aud": "https://" + process.env.OKTA_TENANT,
		"sub": "",
		"response_type": "id_token",
		"response_mode": "fragment",
		"client_id": process.env.OKTA_MFA_CLIENT_ID,
		"redirect_uri": process.env.OKTA_REDIRECT_URI,
		"scope": "openid",
		"acr_values": "urn:okta:app:mfa:attestation",
		"state": state,
		"nonce": "h3lX29$sWGxK3", // This should be generated dynamically
		"login_hint": process.env.OKTA_MFA_USER
	}

	var jwt = nJwt.create(claims, process.env.OKTA_MFA_CLIENT_SECRET)

	jwt.setExpiration(new Date().getTime() + (30*1000)) // thirty seconds from now

	console.log(jwt)

	var token = jwt.compact()
	console.log(token)

	var url = "https://" + process.env.OKTA_TENANT + "/oauth2/v1/authorize?request=" + token

	console.log("\nthe redirect URL is:\n" + url + "\n")

	res.redirect(url)
})

app.post('/getAsset', function(req, res) {

	var options = {
		method: 'POST',
		url: 'https://' + process.env.OKTA_TENANT + '/oauth2/v1/introspect',
		qs: {
			token: req.body.id_token,
			token_type_hint: 'id_token',
			client_id: process.env.OKTA_MFA_CLIENT_ID,
			client_secret: process.env.OKTA_MFA_CLIENT_SECRET
		},
		headers: {
			'Cache-Control': 'no-cache',
			'Content-Type': 'application/x-www-form-urlencoded',
			Accept: 'application/json'
		}
	}

	request(options, function (error, response, body) {
		if (error) throw new Error(error)

		var obj = JSON.parse(body)

		console.log("the response from /introspect is: ")
		console.dir(body)

		if (obj.active === true) {
			var imgURL = "/img/gameboy.jpg"

			res.json({imgURL: imgURL})
		}
	})
})