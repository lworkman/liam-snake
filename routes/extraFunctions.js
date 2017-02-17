// Variables needed to create the base snake used by all snakes

var baseSnake = { };
var id = "";

// Constructor for the base snake. Takes in the request body.

var createBaseSnake = function(requestBody){
  id = requestBody.you;
  return Object.create(baseSnake,{
    // Insert properties of the base snake object here
    myID : {
      value: id
    },
    myBody : {
      value: requestBody.snakes.find(findOurSnakeFromArray)
    },
    myMove : {
      value: "up"
    }
  })
};

// Figures out which snake you are from the returned snakes

var findOurSnakeFromArray = function (snakeObj) {
    return snakeObj.id == id;
  };

var differentSnakes = {

  //====================
  // SNAKE AI
  //====================

  /**
   * Moves randomly
   *
   * @returns {*}
   */
  randoSnake: function () {
    var rand = Math.floor((Math.random() * 4) + 1);

    switch (rand) {
      case 1:
        return 'up';
      case 2:
        return 'right';
      case 3:
        return 'down';
      case 4:
        return 'left';
    }
  },

  /**
   * Moves up and right in a zig-zag, no matter what
   *
   * @param ourSnakeCoordinates
   * @returns your move
   */
  dumbSnake: function (ourSnakeCoordinates) {
    if (ourSnakeCoordinates[0][0] < ourSnakeCoordinates[0][1]) {
      return 'right';
    }
    else {
      return 'up';
    }
  },

  /** 
   * Example snake for using the constructor. Will probably never be used.
   * 
   * @param the body of the request
   * @returns your move
  */

  funSnake: function (requestBody){

    var thisSnake = createBaseSnake(requestBody);

    return thisSnake.myMove;
  }

};

module.exports = differentSnakes;