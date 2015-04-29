var https = require('https');
var fs = require('fs');

var options = {
   hostname: 'localhost',
   port: 8888,
   path: '/check_for_update',
   method: 'GET',
   key: fs.readFileSync('certs/client1.key'),
   cert: fs.readFileSync('certs/client1.pem'),
   requestCert: true,
   ca: [ fs.readFileSync('certs/ca.pem') ]
};

var req = https.request(options, function(res) {
  console.log("statusCode: ", res.statusCode);
  console.log("headers: ", res.headers);

  res.on('data', function(d) {
    process.stdout.write("this is data: ", d);
  });
});
req.end();

req.on('error', function(e) {
  console.log('An error occured');
  console.error(e);
});
