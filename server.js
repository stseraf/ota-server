//var https = require("https");
var http = require("http");
var url = require("url");
var fs = require('fs');

var options = {
   key: fs.readFileSync('certs/server.key'),
   cert: fs.readFileSync('certs/server.pem'),
   requestCert: true,
   ca: [ fs.readFileSync('certs/ca.pem') ]
};

function start(route, handle) {
   function onRequest(request, response) {
      var pathname = url.parse(request.url).pathname;
      console.log("Request for " + pathname + " received.");
      route(handle, pathname, response, request)
   }
    
   //https.createServer(options, onRequest).listen(8888);
   http.createServer(onRequest).listen(1212);
   console.log("Server has started at port 1212");
}

exports.start = start;
