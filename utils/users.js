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

module.exports = {
	'findById' : findUserById,
	'findByName' : findUserByName,
	'toList' : accumulateUsers
};