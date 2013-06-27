//console colours
var	blue  	= '\033[34m',
	green 	= '\033[32m',
	red   	= '\033[31m',
	yellow 	= '\033[33m',
	reset 	= '\033[0m';

var call_id = '';

console.log(blue+'Twilio App Starting'+reset);

var express = require('express')
,	http 	= require('http')
,	app 	= express()
,	server 	= http.createServer(app)
,	io = require('socket.io').listen(server)
,	phone = require('twilio')('AC899603d891dcc0517d0c9d4e65650007', '8e92349b54e47026f1dcde55b4ea251c')
,	twilio = require('twilio');

io.configure(function(){
        io.enable('browser client minification');  // send minified client
        io.enable('browser client etag');          // apply etag caching logic based on version number
        io.enable('browser client gzip');          // gzip the file
        io.set('log level', 1);                    // reduce logging
});

app.configure('development', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
  app.use(express.logger());
});

app.configure('production', function(){
  app.use(express.static(__dirname + '/public'));
  app.use(express.errorHandler());
});

server.listen(process.env.PORT || 8080, function (err) {
  if (err) {
    throw err;
  }

  console.log(green+'info: '+reset+'Express server started on '+yellow+'%s:'+yellow+'%s'+reset+'.', server.address().address, server.address().port);
  console.log(green+'info: '+reset+'App running in '+yellow+process.env.NODE_ENV+reset+' mode.');
});

app.post('/connect', function(req, res) {
	var resp = new twilio.TwimlResponse();
		resp.say("On a scale of 1 to 9, how do you feel?", {
    		voice:'woman',
    		language:'en-gb',
    		loop: 1
		}).record({
    		action: 'http://g-proto.jit.su/post-record',
			timeout:1,
			transcribe: true,
			playBeep: false,
			transcribeCallback: "/transcribed"
		});
		
        res.type('text/xml');
        res.send(resp.toString());
});

app.post('/post-record', function(req, res) {
	var resp = new twilio.TwimlResponse();
		resp.say('Hmm interesting, goodbye', {
			voice:'woman',
    		language:'en-gb',
    		loop: 1
		}).hangup();
		
		res.type('text/xml');
		res.send(resp.toString());
});

io.sockets.on('connection', function (socket) {
	socket.on('call_number', function(number) {
		phone.makeCall({
			to: number,
    		from: '+441204238481', // A number you bought from Twilio and can use for outbound communication
    		url: 'http://g-proto.jit.su/connect' // A URL that produces an XML document (TwiML) which contains instructions for the call

		}, function(err, responseData) {
			if(!err) {
				call_id = responseData.sid;
			} else {
				console.log(err);
			}
		});
	});
	
	socket.on('get_transcripts', function() {
		phone.transcriptions.list(function(err, data) {
			data.transcriptions.forEach(function(transcription) {
       			socket.emit('all_transcripts', transcription);
    		});
		});
	});
	
	app.post('/transcribed', function(req, res) {
		phone.transcriptions.list(function(err, data) {
			io.sockets.emit("recorded", data.transcriptions[0].transcription_text);
    		res.send({});
		});
	});
});
