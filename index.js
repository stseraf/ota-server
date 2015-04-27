var server = require("./server");
var router = require("./router");
var requestHandlers = require("./requestHandlers");

var handle = {}
handle["/"] = requestHandlers.hello;
handle["/check_for_update"] = requestHandlers.check;
handle["/get_update"] = requestHandlers.get;
handle["/test"] = requestHandlers.test;
server.start(router.route, handle);
