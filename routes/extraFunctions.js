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
  var snakeBodies = [];

  // requestBody.snakes[indexOfBody].coords.splice(0,1);

  // for (var i = 0; i< requestBody.snakes.length; i++){
  //   snakeBodies = snakeBodies.concat(requestBody.snakes[i].coords);
  // }

  //move = whichMove(head,snakeBodies,requestBody.width,requestBody.height);

  move = dontHitWall(body.coords,requestBody.width,requestBody.height);

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

var howManyMoves = function(point,obstacle){
	var moves = 0;
  moves += Math.abs(point[0]-obstacle[0]);
  moves += Math.abs(point[1]-obstacle[1]);
  
  if (moves == 0){
 		return -100000;
  }
	return moves * 10;
};

var figureOutDistances = function(head,positionOfStuff){

  var moves = {"left": 0, "right": 0, "up": 0, "down": 0};
  
  var leftMove = [head[0]-1,head[1]];
  var rightMove = [head[0]+1,head[1]];
  var upMove = [head[0],head[1]-1];
  var downMove = [head[0],head[1]+1];
  
  for (var i = 0; i < positionOfStuff.length; i++){ 	
    if (moves.left >= 0){
  		moves.left += Math.floor(howManyMoves(leftMove,positionOfStuff[i]));
    }
    if (moves.right >= 0){
  		moves.right += Math.floor(howManyMoves(rightMove,positionOfStuff[i]));
    }
    if (moves.up >= 0){
  		moves.up += Math.floor(howManyMoves(upMove,positionOfStuff[i]));
    }
    if (moves.down >= 0){
  		moves.down += Math.floor(howManyMoves(downMove,positionOfStuff[i]))  
    };
  }
  
  return moves;
};

var whichMove = function(head,positionOfStuff,width,height){
	var chosenMove = "up";
  var chosenMoveScore = 0;
  var whichMoveHolder = figureOutDistances(head,positionOfStuff);
  dontHitWall(head,width,height,whichMoveHolder);
  
  for(property in whichMoveHolder){
  	if (chosenMoveScore < whichMoveHolder[property]){
    	chosenMove = property;
    }
  }
  
   return chosenMove;
}

var dontHitWall = function(body,width,height){

    var moves = {"left": 0, "right": 0, "up": 0, "down": 0};
    var chosenMove = "up";
    var chosenMoveScore = -1;

    if (body[0][0] + 1 >= width || body[0][0] + 1 == body[1][0]){
      moves.right = -1;
    }
    if (body[0][0] - 1 < 0 || body[0][0] - 1 == body[1][0]){
      moves.left = -1;
    }
    if (body[0][1] + 1 >= height || body[0][1] + 1 == body[1][1]){
      moves.down = -1;
    }
    if (body[0][1] - 1 < 0 || body[0][1] - 1 == body[1][1]){
      moves.up = -1;
    }



    for(property in moves){
      if (chosenMoveScore < moves[property]){
        chosenMove = property;
        chosenMoveScore = moves[property];
      }
    }

    return chosenMove;

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