let socket = io.connect('https://video-chatyassine.herokuapp.com/');

const video  = document.querySelector('video')


let client  = {}


//get stream
navigator.mediaDevices.getUserMedia({ video : true, audio : true})
.then(stream => {

	socket.emit('NewClient')
	video.srcObject = stream
	video.play()

	//used to initailize a peer
	function InitPeer(type){

		let peer = new SimplePeer({ 
			initiator : (type == "init") ? true : false,
			stream : stream,
			config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }] },

			trickle : true})

		peer.on('stream', function(stream){
			CreateVideo(stream)
		})

		peer.on('close', function(){
			document.getElementById("peerVideo").remove();
			peer.destroy()
		})

		return peer
	}



	//for peer of type init -- call
	function MakePeer(){
		client.gotAnswer = false

		let peer = InitPeer('init')

		peer.on('signal', function(data){
			if(!client.gotAnswer){
				socket.emit('Offer', data)
			}
		})

		client.peer = peer
	}


	//for peer of type notInit -- answer
	function FrontAnswer(offer){
		let peer = InitPeer("notInit")

		peer.on('signal', function(data){
			socket.emit('Answer', data)
		})

		peer.signal(offer)
	}


	function SignalAnswer(answer){

		client.gotAnswer = true
		let peer = client.peer
		peer.signal(answer)

	}


	function CreateVideo(stream){
		let video = document.createElement('video')

		video.id = 'peerVideo'

		video.srcObject = stream
		video.class = 'embed-responsive-item'
		document.querySelector('#peerDiv').appendChild(video)

		video.play()

	}


	function SessionActive(){

		document.write('Session Active. please come back later')

	}

	socket.on('BackOffer', FrontAnswer)
	socket.on('BackAnswer', SignalAnswer)
	socket.on('SessionActive', SessionActive)
	socket.on('CreatePeer', MakePeer)

})
.catch(err => document.write(err))


