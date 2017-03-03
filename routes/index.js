var express = require('express');
var router  = express.Router();
var differentSnakes = require("./extraFunctions.js");

router.get('/head-image', function(req,res){
    var options = {
        root: __dirname + '/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent' : true,
        }
    };

    res.sendFile('wasonceaman.jpg',options,function(err){
        if(err){
            console.log(err);
        }else{
            console.log('Sent: wasonceaman.jpg');
        }
    });
});
router.get('/remora/head-image', function(req,res){
    var options = {
        root: __dirname + '/',
        dotfiles: 'deny',
        headers: {
            'x-timestamp': Date.now(),
            'x-sent' : true,
        }
    };

    res.sendFile('remora.jpg',options,function(err){
        if(err){
            console.log(err);
        }else{
            console.log('Sent: remora.jpg');
        }
    });
});
// Handle POST request to '/start'
router.post('/start', function (req, res) {
  // NOTE: Do something here to start the game

  // Response data
  var data = {
    color: '#ef0087',
    name: "Was Once A Man",
    head_url: "/head-image", // optional, but encouraged!
    taunt: "Cobra LALALALALALALALALA!", // optional, but encouraged!
  }

  return res.json(data)
})

// Handle POST request to '/start'
router.post('/remora/start', function (req, res) {
  // NOTE: Do something here to start the game

  // Response data
  var data = {
    color: '#9bcaff',
    name: "Remora Snake",
    head_url: "/head-image", // optional, but encouraged!
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

  var data = {
    move: differentSnakes.staticSnake(req.body),
    taunt: differentSnakes.staticTaunt(req.body)
  };

  return res.json(data)
});

module.exports = router;