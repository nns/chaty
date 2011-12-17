
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , sio = require('socket.io')

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', routes.index);
app.get('/clear',function(req,res){
  msgs = [];
  res.redirect('/');
});

app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var io = sio.listen(app);
var users = {};
var msgs = [];
io.sockets.on('connection',function(socket){
  console.log('connection');
  socket.emit('allUser', users);
  if(msgs.length != 0){
    socket.emit('push allMsg', msgs); 
  }

  socket.on('newUser',function(data){
    var name = data.name;
    console.log('userName=%s', name);
    console.log('users=%s',users[name]);
    if(users[name]){
      socket.emit('newUser error','This name already exists');
    } else {
      var user = {userName:name,socketid:socket.id};
      socket.userName = name;
      users[name] = user;
      socket.emit('newUser success',user);
      socket.broadcast.emit('addUser',user);
    }
  });
  
  socket.on('send comment',function(data){
    var msg = {t:new Date(),comment:data[1],userName:data[0].userName};
    var indexof = msg.comment.indexOf('#');
    if(indexof != -1){
      var target = msg.comment.slice(indexof+1);
      console.log(target);
      if(users[target]){
        console.log('get target');
        io.sockets.socket(users[target].socketid).emit('recv scomment', msg);
      }
    } else {
      //to mongodb
      msgs.push(msg);
      console.log('msg=%s',msg);
      io.sockets.emit('recv comment',msg);
    }
  });

  socket.on('disconnect',function(){
    if(socket.userName){
      delete users[socket.userName];
      socket.broadcast.emit('removeUser',socket.id);
    }
    
  });
});
