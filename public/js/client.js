var socket = io.connect('http://g-proto.jit.su/');

$(document).ready(function(){
	$('.callbutton').click(function() {
		socket.emit('call_number',$('span.number').text());
	});
	
	$('.console_transcripts').click(function() {
		socket.emit('get_transcripts');
	});
	
	socket.on('all_transcripts', function(results) {
		console.log(results);
	});
});

socket.on('recorded', function(recorded) {
	console.log(recorded);
	recorded = recorded.replace (".", "");
	$('.responses').prepend('<div style="padding: 10px; border: 1px solid #000; font-size: 20px;" class="response"> Text: '+ recorded +'</div>');
});
	
socket.on('call_id', function(call_id) {
	console.log("Call ID: "+call_id);
});