//var express = require('express');
//var app = express();
//var cool = require('cool-ascii-faces');

//app.set('port', (process.env.PORT || 5000));
//app.use(express.static(__dirname + '/public'));

//app.get('/', function(request, response) {
//  response.send("Hello I'm an SWDL server and here's a cool smile for you: " + cool());
//});

//app.listen(app.get('port'), function() {
//  console.log("Node app is running at localhost:" + app.get('port'));
//});

var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.hello;
handle["/check_for_update"] = requestHandlers.check;
handle["/get_update"] = requestHandlers.get;
handle["/test"] = requestHandlers.test;
server.start(router.route, handle);
