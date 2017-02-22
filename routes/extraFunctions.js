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
  var health = 100 / requestBody.snakes[indexOfBody].health_points * 50;
  var goalFood = [];

  requestBody.snakes.splice(indexOfBody,1);

  for (var i = 0; i< requestBody.snakes.length; i++){
     badSnakes = badSnakes.concat(requestBody.snakes[i].coords);
  }

  thingsThatWillDisappear = thingsThatWillDisappear.concat(disappearByTimeSnakeGetsThere(head,body.coords,body.coords.length));
  goalFood = reorganizeFood(requestBody.food,head);

  var astar = aStarSnakes.astarSnake(requestBody.width,requestBody.height,head,goalFood,badSnakes,body.coords,thingsThatWillDisappear,body.health_points);

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

var areWeInATunnel = function(point,obstacles,height,width){

  var horizontalCovered = 0;
  var verticalCovered = 0;
  var directions = ["up","down","left","right"];

  for (var z = 0; z < directions.length; z++){
    if (pointExists(point,directions[z],obstacles)){
      if (z < 2){
        verticalCovered ++
      }
      else {

      }
    }
  }

  if (sidesCovered == 2){
    console.log("In a tunnel!");
  }
}

// Figures out which snake you are from the returned snakes

var findOurSnakeFromArray = function (snakeObj) {
    return snakeObj.id == id;
  };

var howFarAwayFromHead = function(head,point){
  distanceHolder = 0;

  distanceHolder += Math.abs(head[0]-point[0]);
  distanceHolder += Math.abs(head[1]-point[1]);

  return distanceHolder;
}

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

var disappearByTimeSnakeGetsThere = function(head,obstacles,length){
  holder = [];
  for(var i = 0;i<obstacles.length;i++){

    if (howFarAwayFromHead(head,obstacles[i]) > length-i){
      holder.push(obstacles[i]);
    }
  }

  return holder;
}

/**
 * Attempts to fill in areas:
 */

var directions = ["up","right","down","left"];
var freeSpace;
var point = [];
var chosenLast;
var obstacles = [];
var chosen;
var overflow = 0;

for (var i = 0; i < 10; i ++){
	obstacles.push([-1,i]);
  obstacles.push([i,-1]);
  obstacles.push([10,i]);
  obstacles.push([i,10]);
}

function changeDirections(directionChosen){

    directionChosen ++;
  	if (directionChosen >= directions.length){
    	directionChosen = 0;
    }
    return directionChosen;
}

function pointExists(point,direction,obstacles){

		var pointCheck = [];
    
		switch(direction){
    	case "up":
      	pointCheck[0] = point[0];
      	pointCheck[1] = point[1]-1;
      	break;
    	case "right":
      	pointCheck[0] = point[0]+1;
      	pointCheck[1] = point[1];
      	break;
    	case "down":
      	pointCheck[0] = point[0];
      	pointCheck[1] = point[1]+1;
      	break;
    	case "left":
      	pointCheck[0] = point[0]-1;
      	pointCheck[1] = point[1];
      	break;
    }
    for (var i = 0; i < obstacles.length; i++){
      if (pointCheck[0] == obstacles[i][0]){
        if (pointCheck[1] == obstacles[i][1]){
          return true;
        }
      }
    }
}

function movePoint(direction){

	obstacles.push(point);

	switch(direction){
  	case "up":
    	point = [point[0],point[1]-1];
    	break;
  	case "right":
    	point = [point[0]+1,point[1]];
    	break;
  	case "down":
    	point = [point[0],point[1]+1];
    	break;
  	case "left":
    	point = [point[0]-1,point[1]];
    	break;
  }
}

function moveClockwise(){
  
  if (pointExists(directions[0]) && pointExists(directions[1]) && pointExists(directions[2]) && pointExists(directions[3])){
 	 return false;
  }
  
  if (pointExists(directions[chosenLast]) && pointExists(directions[chosen])){
    chosenLast = chosen;
    chosen = changeDirections(chosen);
  }
  else if (pointExists(directions[chosenLast])){
  	freeSpace ++;
  	movePoint(directions[chosen]);
  }
  else {
  	freeSpace ++;
  	movePoint(directions[0]);
  }
  
  return true;
  
}

function letsKeepMoving(head,badThings){

  obstacles = [];

  for (var i = 0; i < badThings.length; i++){
    obstacles.push(badThings[i]);
  }
  point[0] = head[0];
  point[1] = head[1];

  chosenLast = 0;
  chosen = 1;
  freeSpace = 0;
  overflow = 0;
  
  while (overflow < 500){
  	moveClockwise();
    overflow ++;
  }

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