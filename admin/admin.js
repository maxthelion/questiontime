Pusher.host = "ws.darling.pusher.com"
Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
};
var pusher = new Pusher('2b4dbdeb570fc373332f')

function addPlayer(data){
  $('#particpantList').append('<p>' + data.name + ' : ' + data.score +'</p>')
}

$().ready(function(){
  $('#startGame').hide()
  $('#stopGame').hide()
  
  
  pusher.connection.bind('connected', function(){
    pusher.back_channel.trigger('start', {})
  })
  
  pusher.back_channel.bind('playerList', function(data){
    for( i in data) {
      addPlayer(data[i])
    }
    $('#startGame').show().click(function(){
      pusher.back_channel.trigger('start', {})
      
      $('#startGame').hide()
    })
  })
  
  pusher.back_channel.bind('winner', function(data){
    $('#particpantList').empty()
    for( i in data) {
      addPlayer(data[i])
    }
  })
  
  pusher.back_channel.bind('newPlayer', function(data){
    addPlayer(data)
  })
})