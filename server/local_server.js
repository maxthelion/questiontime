var Pipe = require('pusher-pipe');
var client = Pipe.createClient({
    key: '2b4dbdeb570fc373332f',
    secret: '46edda14a70079d756e8',
    app_id: 66,
    debug: false
});

client.subscribe(['socket_message', 'socket_existence'])

function randOrd(){
  return (Math.round(Math.random())-0.5); 
}

function near(n){
  var variance = Math.random() * 20;
  return Math.floor(n + variance);
}

function generateQuestion(){
  var a = Math.floor( Math.random() * 100 )
  var b = Math.floor( Math.random() * 100 )
  var question = a + "+" + b
  correctAnswer = eval(a + "+" + b)
  var answers = [
    near(correctAnswer),
    near(correctAnswer),
    near(correctAnswer),
    correctAnswer 
  ].sort( randOrd );
  return {
    question: question,
    answers: answers
  }
}

function sendNewQuestion(){
  questionData = generateQuestion()
  for (i in activeUsers) {
    client.socket(i).trigger('newQuestion', questionData)
  };
}

function sendToAdmin(eventName, data){
  if (admin) {
    client.socket(admin).trigger(eventName, data)
  }
}

var activeUsers = {}
var currentQuestion = null;
var admin = null
var questionData = generateQuestion();

client.sockets.on('close', function(socketId) {
  if(activeUsers[socketId]) 
    console.log('player left: ' + activeUsers[socketId].name )
  delete activeUsers[socketId];
  sendToAdmin('playerList', activeUsers)
});

// new player registering
client.sockets.on('event:register', function(socketId, data){
  console.log('player registered: ' + data.name )
  activeUsers[socketId] = {
    socketId: socketId,
    name: data.name,
    score: 0
  }
  if (questionData != null){
    client.socket(socketId).trigger('newQuestion', questionData)
  }
  sendToAdmin('newPlayer', activeUsers[socketId])
})

// Someone submitted an answer
client.sockets.on('event:submitAnswer', function(socketId, data){
  console.log(activeUsers[socketId].name +' answered '+ data.answer);
  if (data.answer == correctAnswer){
    activeUsers[socketId].score++
    sendToAdmin('winner', activeUsers)
    sendNewQuestion()
    sendToAdmin('newQuestion', questionData)
    console.log('CORRECT! sending everyone a new question!');
  } 
})

// admin moving to new question
client.sockets.on('event:next', function(socketId, data){
  console.log('NEXT QUESTION!!!');
  sendNewQuestion()
})

//Admin has connected, send them current players
client.sockets.on('event:start', function(socketId, data){
  admin = socketId
  sendToAdmin('playerList', activeUsers)
  sendToAdmin('newQuestion', questionData)
  console.log('Sending player list to admin');
})

client.connect();
