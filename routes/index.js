var express = require('express')
var router  = express.Router()
var extraFunctions = require("./extraFunctions.js");

// Handle POST request to '/start'
router.post('/start', function (req, res) {
  // NOTE: Do something here to start the game

  var inputs = req.query;
  // Response data
  var data = {
    color: "#DFFF00",
    name: "Was Once A Man",
    head_url: "http://www.placecage.com/c/200/200", // optional, but encouraged!
    taunt: "Cobra LALALALALALALALALA!", // optional, but encouraged!
    params: inputs,
  }

  return res.json(data)
})

// Handle POST request to '/move'
router.post('/move', function (req, res) {
  // NOTE: Do something here to generate your move

  // Response data
  var data = {
    move: extraFunctions.randoSnake(), // one of: ['up','down','left','right']
    taunt: 'Get Rekt Jameson', // optional, but encouraged!
  }

  return res.json(data)
});

module.exports = router
