var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);

var chatRoomName = 'chat room';

var instances = {'default': {
	'users': []
}};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/htdocs/index.html');
});

app.use(express.static(path.join(__dirname, '/htdocs')));

var findUserById = function(userList, userId) {
  console.log('findUserById: (UserList: ' + JSON.stringify(userList) + ', UserId: ' + userId + ')' );
	var len = userList.length;
	var i, userRec, currRec;
	for(i=0; i<len; ++i) {
		currRec = userList[i];
		if(currRec.id === userId) {
			return {'index':i, 'userRec':currRec};
		}
	}

	return undefined;
};

var findUserByName = function(userList, userName) {
	var len = userList.length;
	var i, currRec;
	for(i=0; i<len; ++i) {
		currRec = userList[i];
		if(currRec.name === userName) {
			return currRec;
		}
	}

	return undefined;
};

var accumulateUsers = function(userList) {
	var len = userList.length;
	var i, ret = [];
	ret.length = len;
	for(i=0; i<len; ++i) {
		ret[i] = userList[i].name;
	}
	return ret;
};


io.on('connection', function(socket){
  console.log('EVENT: connection - ' + socket.id);
  socket.join(chatRoomName);

  socket.on('chat request state', function(){
	  var allUsers = accumulateUsers(instances.default.users);
	  console.log('EVENT: State Snapshot Request (' + socket.id + ') - users: ' + allUsers);
	  io.to(socket.id).emit('chat users', allUsers);
	  //socket.emit('chat users', allUsers);
    io.to(socket.id).emit('chat message', {'text': 'this is just a test', 'userName': 'abc'});
  });

  socket.on('disconnect', function() {
  	var userList = instances.default.users;
  	var prevEntry = findUserById(userList, socket.id);

  	if(typeof(prevEntry) !== "undefined") {
  		var prevUserRec = prevEntry.userRec;
  		socket.broadcast.to(chatRoomName).emit('chat disconnect', prevUserRec.name);
  		console.log('EVENT: disconnect - index: ' + prevEntry.index + ' - ' + JSON.stringify(prevUserRec));

  		userList.splice(prevEntry.index, 1);
  		console.log('EVENT: Updated User List - ' + JSON.stringify(userList));
  	} else {
  		console.log('EVENT: disconnect error - id ' + socket.id);
  	}
  });

  socket.on('chat name', function(newName){
  	var userList = instances.default.users;

  	var prevEntry = findUserById(userList, socket.id)
  	if( typeof(prevEntry) === "undefined") {
  		var newRec = {id: socket.id, name: newName};
  		userList.push(newRec);
  		socket.broadcast.to(chatRoomName).emit('chat join', newName);
  		console.log('EVENT: New User Name - ' + JSON.stringify(newRec));
  		socket.in(socket.id).emit('chat message', 'this is a test');
  	} else {
  		var prevUserRec = prevEntry.userRec;
  		var changeMsg = {'oldName':prevUserRec.name, 'newName':newName};
  		socket.broadcast.to(chatRoomName).emit('chat rename', changeMsg);
  		console.log('EVENT: User Name Change - ' + JSON.stringify(changeMsg));
  		prevUserRec.name = newName;
  	}
  	
    console.log('EVENT: User Name List - ' + JSON.stringify(userList));
  });

  socket.on('chat message', function(msg){
    var userEntry = findUserById(instances.default.users, socket.id);
    var data = {'text':msg, 'userName':''};
    if(typeof(userEntry) !== 'undefined') {
    	data.userName = userEntry.userRec.name;
    }
    console.log('EVENT: message - ' + JSON.stringify(data));
    socket.broadcast.to(chatRoomName).emit('chat message', data);
  });
});

http.listen(3000, function(){
  console.log('listening on *:3000');
});