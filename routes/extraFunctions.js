// Variables needed to create the base snake used by all snakes

var aStarSnakes = require("./a_star/a_start.js");

var baseSnake = { };
var id = "";
var moves = ["up","down","left","right"];

// Constructor for the base snake. Takes in the request body.

var createBaseSnake = function(requestBody){

  id = requestBody.you;

  var body = requestBody.snakes.find(findOurSnakeFromArray);
  var head = body.coords[0];
  var indexOfBody = requestBody.snakes.indexOf(body);
  var badSnakes = [];
  var thingsThatWillDisappear = [];
  var goalFood = [];

  requestBody.snakes.splice(indexOfBody,1);

  for (var i = 0; i< requestBody.snakes.length; i++){
     badSnakes = badSnakes.concat(requestBody.snakes[i].coords);
  }

  thingsThatWillDisappear = thingsThatWillDisappear.concat(disappearByTimeSnakeGetsThere(head,body.coords));
  goalFood = reorganizeFood(requestBody.food,head);

  var astar = aStarSnakes.astarSnake(requestBody.width,requestBody.height,goalFood,badSnakes,body.coords,thingsThatWillDisappear,body.health_points);

  move = whichDirection(head,astar);

  return Object.create(baseSnake,{
    // Insert properties of the base snake object here
    myID : {
      value: id
    },
    myBody : {
      value: body
    },
    myMove : {
      value: move
    }
  })
};

/**
 * Takes the head and the point to move to and returns the proper direction
 * 
 * @param The head of the snake [Array]
 * @param The point to move to [Array]
 * @returns A direction [String]
 */

var whichDirection = function(head,point){

  if (head[0] < point[0]){
    return "right";
  }
  if (head[0] > point[0]){
    return "left";
  }
  if (head[1] < point[1]){
    return "down";
  }
  if (head[1] > point[1]){
    return "up";
  }

}

/**
 * Figures out which snake you are from the return snakes
 * 
 * @param All the snakes [Array]
 * @returns bool
 */

var findOurSnakeFromArray = function (snakeObj) {
    return snakeObj.id == id;
  };

/**
 * Figures out how far away a point is from the head with no obstacles in the way
 * 
 * @param The head to check [Array]
 * @param The point to check [Array]
 * @returns How many steps it would take to get to the point [Int]
 */

var howFarAwayFromHead = function(head,point){
  distanceHolder = 0;

  distanceHolder += Math.abs(head[0]-point[0]);
  distanceHolder += Math.abs(head[1]-point[1]);

  return distanceHolder;
}

/**
 * Organizes all the food into a ranked array, from closest to furthest (with no obstacles)
 * 
 * @param All the food on the board [Array]
 * @param The head of the snake [Array]
 * @returns A ranked array of food [Array]
 */

var reorganizeFood = function(food,head){
  var foodHolder = [];
  var foodHolderIndex = 0;

  for (var i = 0; i < food.length; i++){
    foodHolder.push(food[i]);
  }

  var whichFood = [];
  var foodScore = 100;

  while (foodHolder.length > 0){
    foodScore = 0;
    foodHolderIndex = 0;
    for (var i = 0; i<foodHolder.length;i++){
      if (howFarAwayFromHead(head,food[i]) >= foodScore){
        foodScore = howFarAwayFromHead(head,food[i]);
        foodHolderIndex = i;
      }
    }
    whichFood.unshift(foodHolder[foodHolderIndex]);
    foodHolder.splice(foodHolderIndex,1);
  }

  return whichFood;
}

/**
 * Goes through all the obstacles on the board and guesses whether they will be gone
 * by the time our snake gets there. Uses the obstacles index to determine this.
 * 
 * @param The head of our snake [Array]
 * @param The obstacles on the board [Array]
 * @return An array of points that will disappear [Array]
 */

var disappearByTimeSnakeGetsThere = function(head,obstacles){
  holder = [];
  for(var i = 0;i<obstacles.length;i++){

    if (howFarAwayFromHead(head,obstacles[i]) > obstacles.length-i){
      holder.push(obstacles[i]);
    }
  }

  return holder;
}

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