var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var extend = require('extend');

var defaultOptions = {
	'serverPort': 3000,
	'rootDir': path.join(__dirname, '../htdocs/')
};

var createServer = function(options) {
	var config = extend({}, defaultOptions, options);
	var serverPort = config.serverPort;
	var rootDir = config.rootDir;

	app.get('/', function(req, res){
	  res.sendFile(path.join(rootDir, 'index.html'));
	});

	app.use(express.static(rootDir));

	http.listen(serverPort, function(){
	  console.log('listening on *:' + serverPort);
	});
};

var getHTTPObject = function() {
	return http;
};

exports.createServer = createServer;
exports.getHTTPObject = getHTTPObject;

if(require.main === module) {
	createServer();
}