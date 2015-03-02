var httpServer = require('./servers/baseHTTPServer');
httpServer.createServer();

var http = httpServer.getHTTPObject();
var io = require('socket.io')(http);
var usersUtil = require('./utils/users');

var chatRoomName = 'chat room';

var instances = {'default': {
	'users': []
}};

io.on('connection', function(socket){
  console.log('EVENT: connection - ' + socket.id);
  socket.join(chatRoomName);

  socket.on('request state', function(){
	  var allUsers = usersUtil.toList(instances.default.users);
	  console.log('EVENT: State Snapshot Request (' + socket.id + ') - users: ' + allUsers);
	  io.to(socket.id).emit('userlist', allUsers);
  });


  socket.on('disconnect', function() {
  	var userList = instances.default.users;
  	var prevEntry = usersUtil.findById(userList, socket.id);

  	if(typeof(prevEntry) !== "undefined") {
  		var prevUserRec = prevEntry.userRec;
  		socket.broadcast.to(chatRoomName).emit('disconnect', prevUserRec.name);
  		console.log('EVENT: disconnect - index: ' + prevEntry.index + ' - ' + JSON.stringify(prevUserRec));

  		userList.splice(prevEntry.index, 1);
  		console.log('EVENT: Updated User List - ' + JSON.stringify(userList));
  	} else {
  		console.log('EVENT: disconnect error - id ' + socket.id);
  	}
  });

  socket.on('name', function(newName){
  	var userList = instances.default.users;

  	var prevEntry = usersUtil.findById(userList, socket.id)
  	if( typeof(prevEntry) === "undefined") {
  		var newRec = {id: socket.id, name: newName};
  		userList.push(newRec);
  		socket.broadcast.to(chatRoomName).emit('join', newName);
  		console.log('EVENT: New User Name - ' + JSON.stringify(newRec));
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
    //socket.broadcast.to(chatRoomName).emit('chat message', data);
  });
});