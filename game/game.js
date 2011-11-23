Pusher.host = "ws.darling.pusher.com"
Pusher.log = function(message) {
    if (window.console && window.console.log) window.console.log(message);
};
var pusher = new Pusher('2b4dbdeb570fc373332f')


function startGame(playerName){
  pusher.connection.bind('connected', function(){
    player = new Player( playerName );

    pusher.back_channel.trigger('register', {name: playerName})

  	game = new GameScreen($('#questions'), player)

  	pusher.back_channel.bind('newQuestion', function(data){
  	  game.populate( data )
  	})

  	$('#questions').show();
  	$('#enterName').hide();
  })
}

var Player = function(name) {
}

$().ready(function(){
	if (localStorage['playerName'] != undefined){
		startGame(localStorage['playerName'])
	} else {
		$('#enterName').show();
		$('#questions').hide();
		$('#nameForm').submit(function(){
		  playerName = $('#playerNameInput').val()
		  if (playerName == ""){
		    alert("enter a name");
		    return false 
		  }
			localStorage['playerName'] = playerName;
      startGame(playerName)
			return false;
		});
	}
	
})

var GameScreen = function(el, player){
  var self = this;
  
  this.populate = function(data){
    $('#controls').show()
    $('#waiting').hide()
    // add the questions
    el.find($('#question')).empty().html(data.question)
    // add the answer
    el.find($('#questionList')).empty()
    for (var i=0; i < data.answers.length; i++) {
      var answerEl = $('<li>' + data.answers[i] + '</li>');
      answerEl.click(function(){
        submitQuestion( $(this).text() )
      })
      $('#questionList').append(answerEl);
    };
  };
  
  var submitQuestion = function(answer){
    $('#questionList').empty()
    pusher.back_channel.trigger('submitAnswer', {answer: answer})
    $('#questionList').append('<li class="submitted">' + answer + '</li>')
  }
}