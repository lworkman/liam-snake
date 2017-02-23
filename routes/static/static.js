var aStarSnakes = require("../a_star/a_start.js");

function staticSnakeController(ownBody,height,width,food,otherSnake,distance){
    var graph = [];
    var goal = [];
    otherSnake = otherSnake || [];

    for(var x = 0; x < width; x++){
        var row = [];
        for (var y = 0; y < height; y++){
                row.push(1);
        }
        graph.push(row);
    }
    for (var i = 1; i< ownBody.length; i++){
        graph[ownBody[i][0]][ownBody[i][1]] = 0;
    }
    graph[ownBody[0][0]][ownBody[0][1]] = 2;
    for (var i = 0; i< otherSnake.length-1; i++){
        graph[otherSnake[i][0]][otherSnake[i][1]] = 0;
    }

    if (distance < 6 && ownBody.length >= 8){
        goal = besideHead(otherSnake,graph);
    }
    else if (ownBody.length < 10 || (ownBody[ownBody.length-1][0] == ownBody[ownBody.length-2][0] && ownBody[ownBody.length-1][1] == ownBody[ownBody.length-2][1])){
        goal = food;
    }
    if (goal.length < 1){
        goal = ownBody[ownBody.length-1];
        graph[ownBody[ownBody.length-1][0]][ownBody[ownBody.length-1][1]] = 1;
    }

    console.log(goal)

    result = aStarSnakes.aStar(graph,goal,ownBody[0]);

    return result;
}

var besideHead = function(otherSnake,graph){

    if (otherSnake[0][1] == otherSnake[1][1]){
        console.log("Horizontal!");
        return returnClearSide(otherSnake[0],graph,false);
    }
    else {
        console.log("Vertical!");
        return returnClearSide(otherSnake[0],graph,true);
    }

}

var returnClearSide = function(point,graph,x){

    x = x || false;

    if (x){
        if (point[0]+1 > 0 && point[0]+1 < graph.length && graph[point[0]+1][point[1]] == 1){
            return [point[0]+1,point[1]];
        }
        if (point[0]-1 > 0 && point[0]-1 < graph.length && graph[point[0]-1][point[1]] == 1){
            return [point[0]-1,point[1]];
        }
    }
    else {
        if (point[1]+1 > 0 && point[1]+1 < graph[0].length && graph[point[0]][point[1]+1] == 1){
            return [point[0],point[1]+1];
        }
        if (point[1]-1 > 0 && point[1]-1 < graph[0].length && graph[point[0]][point[1]-1] == 1){
            return [point[0],point[1]-1];
        }
    }

    return [-1,-1];
}

var staticSnakes = {

    staticSnake: function(body,height,width,food,otherSnake,distance){
        return staticSnakeController(body,height,width,food,otherSnake,distance);
    }

}

module.exports = staticSnakes;