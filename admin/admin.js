Pusher.host = "ws.darling.pusher.com"
Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
};
var pusher = new Pusher('2b4dbdeb570fc373332f')

function addPlayer(data){
  $('#participantList').append('<p>' + data.name + ' : ' + data.score +'</p>')
}

$().ready(function(){  
  // when we connect say we are the admin - bit silly
  pusher.connection.bind('connected', function(){
    pusher.back_channel.trigger('start', {})
  })
  
  // when we get a list of players, draw them
  pusher.back_channel.bind('playerList', function(data){
    $('#participantList').empty()
    for( i in data) {
      addPlayer(data[i])
    }
    $('#next').show().click(function(){
      pusher.back_channel.trigger('next', {})
      return false
    })
  })
  
  // someone has won this round - redraw
  pusher.back_channel.bind('winner', function(data){
    $('#participantList').empty()
    for( i in data) {
      addPlayer(data[i])
    }
  })
  
  // add a new player into the list
  pusher.back_channel.bind('newPlayer', function(data){
    addPlayer(data)
  })
  
  // show the latest taxing question
  pusher.back_channel.bind('newQuestion', function(data){
	  $('#question').empty().html(data.question)
	})
})