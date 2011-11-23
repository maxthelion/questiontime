var Pipe = require('pusher-pipe');
var client = Pipe.createClient({
    key: '2b4dbdeb570fc373332f',
    secret: '46edda14a70079d756e8',
    app_id: 66,
    debug: true
});


function generateQuestion(){
  var a = Math.floor( Math.random() * 10 )
  var b = Math.floor( Math.random() * 10 )
  var question = a + "+" + b
  correctAnswer = eval(a + "+" + b)
  return {
    question: question,
    answers: [
      Math.random() * 100, 
      Math.random() * 100, 
      Math.random() * 100,
      correctAnswer 
    ]
  }
}

function sendNewQuestion(){
  var questionData = generateQuestion()
  for (i in activeUsers) {
    client.socket(i).trigger('newQuestion', questionData)
  };
}

function sendToAdmin(eventName, data){
  if (admin) {
    client.socket(admin).trigger(eventName, data)
  }
}

client.subscribe(['socket_message', 'socket_existence'])

var activeUsers = {}
var currentQuestion = null;
var admin = null

client.sockets.on('close', function(socketId) {
  delete activeUsers[socketId];
});

// new player registering
client.sockets.on('event:register', function(socketId, data){
  activeUsers[socketId] = {
    socketId: socketId,
    name: data.name,
    score: 0
  }
  sendToAdmin('newPlayer', activeUsers[socketId])
})

client.sockets.on('event:submitAnswer', function(socketId, data){
  if (data.answer == correctAnswer){
    activeUsers[socketId].score++
    sendToAdmin('winner', activeUsers)
    console.log( activeUsers )
    sendNewQuestion()
  }
})

// admin starting the game
client.sockets.on('event:start', function(socketId, data){
  admin = socketId
  sendToAdmin('playerList', activeUsers)
  sendNewQuestion()
})

client.connect();
