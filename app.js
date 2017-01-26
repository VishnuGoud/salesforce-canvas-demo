var express = require('express');
var init = require('./dbOperations.js');
var app = express();
var PORT = process.env.PORT || 5000;

//SF app secret
var SF_CANVASAPP_CLIENT_ID = process.env.SF_CANVASAPP_CLIENT_ID;
var SF_CANVASAPP_AUTHURL = process.env.SF_CANVASAPP_AUTHURL;
var SF_CANVASAPP_CALLBACK = process.env.SF_CANVASAPP_CALLBACKURL;

app.configure(function() {
    app.use('/assets',express.static(__dirname + '/assets'));
    app.engine('html', require('ejs').renderFile);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'html');
    app.use(express.cookieParser());

    //session enabled to store token data
    app.use(express.session({
      secret: 'cs secret'
    }));

    app.use(express.bodyParser());
    app.use(express.logger());
    
});

app.get('/',function(req,res){
    //Block user logging in directly
	//res.sendfile('views/error.html');
	res.render('error',{authURL : SF_CANVASAPP_AUTHURL, clientId : SF_CANVASAPP_CLIENT_ID, callbackURI : SF_CANVASAPP_CALLBACK});
});

app.get('/oauth/callback',function(req,res){
    //Block user logging in directly
	res.sendfile('views/oauthcallback.html');
});

//canvas callback
app.post('/canvas/callback', function(req,res){
    init.canvasCallback(req.body, SF_CANVASAPP_CLIENT_SECRET, function(error, canvasRequest){
        if(error){
            res.statusCode = 400;
            return res.render('error',{error: error});
        }
        //saves the token details into session
        init.saveCanvasDetailsInSession(req,canvasRequest);
		res.render('index',{canvasDetails : canvasRequest});
    });
});

exports.server = app.listen(PORT, function() {
    console.log("Listening on " + PORT);
});
