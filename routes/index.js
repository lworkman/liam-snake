var express = require('express')
var router  = express.Router()

// Handle POST request to '/start'
router.post('/start', function (req, res) {
  // NOTE: Do something here to start the game

  var inputs = req.query;
  // Response data
  var data = {
    color: "#DFFF00",
    name: "Once Was A Man",
    head_url: "http://www.placecage.com/c/200/200", // optional, but encouraged!
    taunt: "Let's do thisss thang!", // optional, but encouraged!
    params: inputs,
  }

  return res.json(data)
})

// Handle POST request to '/move'
router.post('/move', function (req, res) {
  // NOTE: Do something here to generate your move

  // Response data
  var data = {
    move: randoSnake(), // one of: ['up','down','left','right']
    taunt: 'Get Rekt Jameson', // optional, but encouraged!
  }

  return res.json(data)
})

var randoSnake = function(){
  var rand = Math.floor((Math.random() * 4) + 1);

  switch(rand){
    case 1:
      return 'up';
    case 2:
      return 'right';
    case 3:
      return 'down';
    case 4:
      return 'left';
  }

};

module.exports = router
