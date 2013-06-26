var socket = io.connect('http://g-proto.jit.su/');

$(document).ready(function(){
	$('.callbutton').click(function() {
		socket.emit('call_number',$('span.number').text());
	});
	
	socket.on('transcription', function(result) {
		console.log(result);
	});
});