var express = require('express');
var router  = express.Router();
var differentSnakes = require("./extraFunctions.js");

// Handle POST request to '/start'
router.post('/start', function (req, res) {
  // NOTE: Do something here to start the game

  // Response data
  var data = {
    color: '#'+Math.random().toString(16).substr(-6),
    name: "Was Once A Man",
    head_url: "http://www.placecage.com/c/200/200", // optional, but encouraged!
    taunt: "Cobra LALALALALALALALALA!", // optional, but encouraged!
  }

  return res.json(data)
})

// Handle POST request to '/start'
router.post('/remora/start', function (req, res) {
  // NOTE: Do something here to start the game

  // Response data
  var data = {
    color: '#'+Math.random().toString(16).substr(-6),
    name: "Remora snake",
    head_url: "/images/bs-logo-light.svg", // optional, but encouraged!
    taunt: " I'm so lonely!", // optional, but encouraged!
  }

  return res.json(data)
})

// Handle POST request to '/move'
router.post('/move', function (req, res) {

  // NOTE: Do something here to generate your move

  //extraFunctions.ourSnakeID = req.body.you;

  //var ourSnake = req.body.snakes.find(extraFunctions.findOurSnakeFromArray);
  // Response data
  var data = {
    move: differentSnakes.funSnake(req.body), // one of: ['up','down','left','right']
    taunt: 'Get Rekt Jameson', // optional, but encouraged!
  }

  return res.json(data)
});

// Handle POST request to '/move'
router.post('/remora/move', function (req, res) {
  // NOTE: Do something here to generate your move

  //extraFunctions.ourSnakeID = req.body.you;

  //var ourSnake = req.body.snakes.find(extraFunctions.findOurSnakeFromArray);
  // Response data
  var data = {
    move: differentSnakes.staticSnake(req.body), // one of: ['up','down','left','right']
    taunt: differentSnakes.staticTaunt(req.body) // optional, but encouraged!
  }

  return res.json(data)
});

module.exports = router;