// Variables needed to create the base snake used by all snakes

var baseSnake = { };
var id = "";
var moves = ["up","down","left","right"];

// Constructor for the base snake. Takes in the request body.

var createBaseSnake = function(requestBody){

  id = requestBody.you;


  var body = requestBody.snakes.find(findOurSnakeFromArray);
  var head = body.coords[0];
  var indexOfBody = requestBody.snakes.indexOf(body);
  var badThingsPositions = [];
  var health = 100 / requestBody.snakes[indexOfBody].health_points * 50;
  var badWalls = [];
  var goodWalls = [];

  var xWall = -1;
  var yWall = -1;

  if (head[0] > requestBody.width/2){
    xWall = requestBody.width;
  }
  if (head[1] > requestBody.height/2){
    yWall = requestBody.height;
  }

  for (var i = -1; i <= requestBody.width; i++){
    badWalls.push([xWall,i]);
  }
  for (var i = -1; i <= requestBody.height; i++){
    badWalls.push([i,yWall]);
  }
  for (var i = -1; i <= requestBody.width; i++){
    goodWalls.push([xWall * -1,i]);
  }
  for (var i = -1; i <= requestBody.height; i++){
    goodWalls.push([i,yWall * -1]);
  }

  requestBody.snakes[indexOfBody].coords.splice(0,1);

  for (var i = 0; i< requestBody.snakes.length; i++){
     badThingsPositions = badThingsPositions.concat(requestBody.snakes[i].coords);
  }
  badThingsPositions = badThingsPositions.concat(badWalls);

  move = whichMove(head,badThingsPositions,requestBody.food,goodWalls,health,requestBody.width,requestBody.height);

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

// Figures out which snake you are from the returned snakes

var findOurSnakeFromArray = function (snakeObj) {
    return snakeObj.id == id;
  };

var howManyMoves = function(point,obstacle,shouldPursue,multiplier){
	var moves = 0;

  moves += Math.abs(point[0]-obstacle[0]);
  moves += Math.abs(point[1]-obstacle[1]);
  if (moves == 0 && !shouldPursue){
 		return -100000;
  }
  else if (shouldPursue){
    return 100/moves * multiplier;
  }
	return 10 * moves;
};

var figureOutDistances = function(head,positionOfStuff,whichMoves,positive,multiplier){

  var moves = whichMoves;
  
  var leftMove = [head[0]-1,head[1]];
  var rightMove = [head[0]+1,head[1]];
  var upMove = [head[0],head[1]-1];
  var downMove = [head[0],head[1]+1];
  var negativeMultiplier = 1;
  
  for (var i = 0; i < positionOfStuff.length; i++){ 	
    if (moves.left >= 0){
  		moves.left += Math.floor(howManyMoves(leftMove,positionOfStuff[i],positive,multiplier));
    }
    if (moves.right >= 0){
  		moves.right += Math.floor(howManyMoves(rightMove,positionOfStuff[i],positive,multiplier));
    }
    if (moves.up >= 0){
  		moves.up += Math.floor(howManyMoves(upMove,positionOfStuff[i],positive,multiplier));
    }
    if (moves.down >= 0){
  		moves.down += Math.floor(howManyMoves(downMove,positionOfStuff[i],positive,multiplier));  
    };
  }
  
  return moves;
};

var whichMove = function(head,positionOfStuff,food,goodWalls,health,width,height){


	var chosenMove = "up";
  var chosenMoveScore = -1;
  var whichMoveHolder = dontHitWall(head,width,height);


  whichMoveHolder = findClosestFoodAndHeadToIt(head,food,whichMoveHolder,health);
  whichMoveHolder = figureOutDistances(head,positionOfStuff,whichMoveHolder,false,1);
  //whichMoveHolder = figureOutDistances(head,goodWalls,whichMoveHolder,true,1);
  
  console.log(whichMoveHolder);

  for(property in whichMoveHolder){
  	if (chosenMoveScore < whichMoveHolder[property]){
    	chosenMove = property;
      chosenMoveScore = whichMoveHolder[property];
    }
  }
  
   return chosenMove;
}

var findClosestFoodAndHeadToIt = function(head,food,whichMoveHolder,health){

  moveHolder = whichMoveHolder;

  moveHolder = figureOutDistances(head,food,whichMoveHolder,true,health);

  // if (health < 50) {
  //   for(property in moveHolder){
  //     moveHolder[property] = moveHolder[property] * 10000;
  //   }
  // }

  return moveHolder;

}

var dontHitWall = function(head,width,height){

    var moves = {"left": 0, "up": 0, "right": 0, "down": 0};

    if (head[0] + 1 >= width){
      moves.right = -1;
    }
    if (head[0] - 1 < 0){
      moves.left = -1;
    }
    if (head[1] + 1 >= height){
      moves.down = -1;
    }
    if (head[1] - 1 < 0){
      moves.up = -1;
    }

    return moves;

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