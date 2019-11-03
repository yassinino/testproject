var express = require('express');

var peer = require('simple-peer');

var app = express();

const http = require('http').createServer(app);

const io = require("socket.io")(http)

var port = process.env.PORT || 3000;

http.listen(port, () => {
  console.log('Server listening at port %d', port);
});

let clients = 0


io.on('connection', function(socket){

	socket.on("NewClient", function(){
		if(clients < 2){

			if(clients == 1){
				this.emit('CreatePeer')
			}

		}else {
			this.emit('SessionActive')
		}

		clients++;

	})


	socket.on('Offer', SendOffer)

	socket.on('Answer', SendAnswer)

	socket.on('disconnect', Disconnet)

})


function Disconnet(){
	if(clients > 0){
		clients--;
	}
}


function SendOffer(offer){
	this.broadcast.emit("BackOffer", offer)
}


function SendAnswer(data){
	this.broadcast.emit("BackAnswer", data)
}








