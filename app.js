
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var fs = require("fs");
var http = require('http');
var path = require('path');

var app = express();

var players = {};


// all environments
app.set('port', process.env.PORT || 7000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/chat', routes.chat);
app.get('/users', user.list);





var server = http.createServer(app);
var io = require('socket.io').listen(server);



io.sockets.on("connection", function(socket) {
    console.log('client connected ' + socket.id);
    players[socket.id] = true;

    socket.on('enter', function(name){
        console.log('enter: '+name)
        players[socket.id] = {name: name, socket: socket};
    });

    socket.on('send', function(data) {
      socket.broadcast.emit('receive', data)
    });

    socket.on("disconnect", function() {
        socket.get('name', function(err, name){
            delete players[socket.id];
        });
    });

})

app.get('/publish', function(req, res){
    console.log(req.query)
    io.sockets.emit('receive', {kind: 'data', x: Number(req.query.x), y: Number(req.query.y)})
  res.send({result: 'ok'});
})


server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

