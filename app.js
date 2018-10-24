// Okta + Box Platform integration

////////////////////////////////////////////////////

require('dotenv').config()

//var bodyParser = require('body-parser');

const express = require('express');

// var fs = require('fs');

// var request = require('request');

// var jsonParser = bodyParser.json()

///////////////////////////////////////////////////

// SET UP WEB SERVER
const app = express();

var port = process.env.PORT || 5472;

app.use(express.static('public'))
// app.use(bodyParser.json())
// app.use(bodyParser.urlencoded({ extended: false }))

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