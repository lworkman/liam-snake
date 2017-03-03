var aStar = require("../a_star/a_start.js");

function staticSnakeController(ownBody, height, width, food, sharkBody, distance) {
  console.log("------------REMORA------------------");

  var graph = [],
      goal = [],
      result;

  sharkBody = sharkBody || [];

  for (var x = 0; x < width; x++) {
    var row = [];
    for (var y = 0; y < height; y++) {
      row.push(1);
    }
    graph.push(row);
  }
  for (var i = 1; i < ownBody.length; i++) {
    graph[ownBody[i][0]][ownBody[i][1]] = 0;
  }
  graph[ownBody[0][0]][ownBody[0][1]] = 2;
  for (var i = 0; i < sharkBody.length - 1; i++) {
    graph[sharkBody[i][0]][sharkBody[i][1]] = 0;
  }

  graph = aStar.addArrayToGraph(graph,aStar.findAreaAroundPoint(sharkBody[0],height,width),0);

  if (ownBody.length >= 5) {
    var startingPoint = sharkBody.length <= 7 ? (Math.floor(sharkBody.length / 2)) - 1 : 3;

    console.log('Calculating Suction Point');
    result = getSuctionPoint(graph, sharkBody, startingPoint,ownBody[0]);
  }
  else{
    result = aStar.aStar(graph, food, ownBody[0]);
    result = result.nextPoint;
  }

  console.log(result);

  console.log('------------------------------------');
  return result;
}

var getSuctionPoint = function(graph,sharkBody,startingIndex,head){

    var pointsChecked = [],
        pointsToCheck, pointToCheck, i, j, result;

    for(i = 0; i < graph.length; i++){
        var newRow = [];
        for(j = 0; j < graph[0].length; j++){
            newRow.push(false);
        }
        pointsChecked.push(newRow);
    }

    for(i = 0; i <= Math.floor(sharkBody.length / 2); i++){
        var potentialPaths = [],
            shortestPath = 0,
            nextPoint = [];

        if(startingIndex - i > 0){
          pointsToCheck = getClearSides(sharkBody[startingIndex - i],graph);
          for(j = 0;j < pointsToCheck.length; j++){
            pointToCheck = pointsToCheck[j];
            if(pointsChecked[pointToCheck[0]][pointToCheck[1]] !== true){
              pointsChecked[pointToCheck[0]][pointToCheck[1]] = true;
              result = aStar.aStar(graph,pointToCheck,head);
              potentialPaths.push(result);
            }
          }
        }
        if(startingIndex + i < sharkBody.length && startingIndex + i > 0){
          for(j = 0;j < pointsToCheck.length; j++){
            pointToCheck = pointsToCheck[j];
            if(pointsChecked[pointToCheck[0]][pointToCheck[1]] !== true){
              pointsChecked[pointToCheck[0]][pointToCheck[1]] = true;
              result = aStar.aStar(graph,pointToCheck,head);
              potentialPaths.push(result);
            }
          }
        }

        for(j = 0;j < potentialPaths.length;j++){
            var potentialPath = potentialPaths[j];
            if(potentialPath.pathLength > 0){
                if(shortestPath == 0 || potentialPath.pathLength < shortestPath){
                    shortestPath = potentialPath.pathLength;
                    nextPoint = potentialPath.nextPoint;
                }
            }
        }
        if(nextPoint.length > 0){
            return nextPoint;
        }
    }
};

var getClearSides = function(point, graph){

    var allSides = aStar.findAreaAroundPoint(point,graph.length,graph[0].length),
        clearSides = [];
    for(var i = 0; i < allSides.length; i++){
        var sideToCheck = allSides[i];
        if(graph[sideToCheck[0]][sideToCheck[1]] !== 0){
            clearSides.push(sideToCheck);
        }
    }

    return clearSides;
};

var staticSnakes = {

    staticSnake: function(body,height,width,food,otherSnake,distance){
        return staticSnakeController(body,height,width,food,otherSnake,distance);
    }

}

module.exports = staticSnakes;