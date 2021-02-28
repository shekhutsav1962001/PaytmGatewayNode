const checksum_lib = require('./checksum/checksum');
var PaytmConfig = {
	mid: "Enter your merchant id here",
	key: "Enter your secret key here",
	website: "Grab it from https://business.paytm.com/"
}
const express = require('express')
const app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cors({ origin: '*' }))
const PORT = process.env.PORT || 8080


app.get('/', (req, res) => {
	//for testing purpose
	res.send("Hello from Server")
})

app.get('/pay', (req, res) => {
	var params = {};
	params['MID'] = PaytmConfig.mid;
	params['WEBSITE'] = PaytmConfig.website;
	params['CHANNEL_ID'] = 'WEB';
	params['INDUSTRY_TYPE_ID'] = 'Retail';
	// make sure that orderid be unique all time
	params['ORDER_ID'] = 'TEST_' + new Date().getTime();
	params['CUST_ID'] = 'Customer001';
	// Enter amount here eg. 100.00 etc according to your need
	params['TXN_AMOUNT'] = '11.00';

	if (PORT == 8080) {
		// if you are running it on localhost then
		params['CALLBACK_URL'] = 'http://localhost:' + PORT + '/callback';
	}
	else {
		// if you hosted it
		// hostedurl = write your api(backend) url here
		params['CALLBACK_URL'] = 'https://hostedurl/callback';
	}

	// here you have to write customer's email
	params['EMAIL'] = 'abc@gmail.com';
	// here you have to write customer's phone number
	params['MOBILE_NO'] = '9999999999';

	checksum_lib.genchecksum(params, PaytmConfig.key, function (err, checksum) {

		var txn_url = "https://securegw-stage.paytm.in/order/process"; // for staging
		var form_fields = "";
		for (var x in params) {
			form_fields += "<input type='hidden' name='" + x + "' value='" + params[x] + "' >";
		}
		form_fields += "<input type='hidden' name='CHECKSUMHASH' value='" + checksum + "' >";

		res.writeHead(200, { 'Content-Type': 'text/html' });
		var x = '<html><head><title>Merchant Checkout Page</title></head><body><center><h1>Please do not refresh this page...</h1></center><form method="post" action="' + txn_url + '" name="f1">' + form_fields + '</form><script type="text/javascript">document.f1.submit();</script></body></html>'
		res.write(x);
		res.end();
	});
})


app.post('/callback', (req, res) => {
	let data = req.body
	if (data.STATUS == "TXN_SUCCESS") {
		return res.send({
			status: 0,
			data: data,
			success: true
		});
	}
	else {
		return res.send({
			status: 1,
			data: data,
			success: false
		});
	}
})

app.listen(PORT, () => {
	console.log(`Listing on port ${PORT}`);
})

