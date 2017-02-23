function pathTo(node) {
  var curr = node;
  var path = [];
  while (curr.parent) {
    path.unshift(curr);
    curr = curr.parent;
  }
  return path;
}

function getHeap() {
  return new BinaryHeap(function(node) {
    return node.f;
  });
}

var astar = {
  /**
  * Perform an A* Search on a graph given a start and end node.
  * @param {Graph} graph
  * @param {GridNode} start
  * @param {GridNode} end
  * @param {Object} [options]
  * @param {bool} [options.closest] Specifies whether to return the
             path to the closest node if the target is unreachable.
  * @param {Function} [options.heuristic] Heuristic function (see
  *          astar.heuristics).
  */
  search: function(graph, start, end, options) {
    graph.cleanDirty();
    options = options || {};
    var heuristic = options.heuristic || astar.heuristics.manhattan;
    var closest = options.closest || false;

    var openHeap = getHeap();
    var closestNode = start; // set the start node to be the closest if required

    start.h = heuristic(start, end);
    graph.markDirty(start);

    openHeap.push(start);

    while (openHeap.size() > 0) {

      // Grab the lowest f(x) to process next.  Heap keeps this sorted for us.
      var currentNode = openHeap.pop();

      // End case -- result has been found, return the traced path.
      if (currentNode === end) {
        return pathTo(currentNode);
      }

      // Normal case -- move currentNode from open to closed, process each of its neighbors.
      currentNode.closed = true;

      // Find all neighbors for the current node.
      var neighbors = graph.neighbors(currentNode);

      for (var i = 0, il = neighbors.length; i < il; ++i) {
        var neighbor = neighbors[i];

        if (neighbor.closed || neighbor.isWall()) {
          // Not a valid node to process, skip to next neighbor.
          continue;
        }

        // The g score is the shortest distance from start to current node.
        // We need to check if the path we have arrived at this neighbor is the shortest one we have seen yet.
        var gScore = currentNode.g + neighbor.getCost(currentNode);
        var beenVisited = neighbor.visited;

        if (!beenVisited || gScore < neighbor.g) {

          // Found an optimal (so far) path to this node.  Take score for node to see how good it is.
          neighbor.visited = true;
          neighbor.parent = currentNode;
          neighbor.h = neighbor.h || heuristic(neighbor, end);
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          graph.markDirty(neighbor);
          if (closest) {
            // If the neighbour is closer than the current closestNode or if it's equally close but has
            // a cheaper path than the current closest node then it becomes the closest node
            if (neighbor.h < closestNode.h || (neighbor.h === closestNode.h && neighbor.g < closestNode.g)) {
              closestNode = neighbor;
            }
          }

          if (!beenVisited) {
            // Pushing to heap will put it in proper place based on the 'f' value.
            openHeap.push(neighbor);
          } else {
            // Already seen the node, but since it has been rescored we need to reorder it in the heap
            openHeap.rescoreElement(neighbor);
          }
        }
      }
    }

    if (closest) {
      return pathTo(closestNode);
    }

    // No result was found - empty array signifies failure to find path.
    return [];
  },
  // See list of heuristics: http://theory.stanford.edu/~amitp/GameProgramming/Heuristics.html
  heuristics: {
    manhattan: function(pos0, pos1) {
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return d1 + d2;
    },
    diagonal: function(pos0, pos1) {
      var D = 1;
      var D2 = Math.sqrt(2);
      var d1 = Math.abs(pos1.x - pos0.x);
      var d2 = Math.abs(pos1.y - pos0.y);
      return (D * (d1 + d2)) + ((D2 - (2 * D)) * Math.min(d1, d2));
    }
  },
  cleanNode: function(node) {
    node.f = 0;
    node.g = 0;
    node.h = 0;
    node.visited = false;
    node.closed = false;
    node.parent = null;
  }
};

/**
 * A graph memory structure
 * @param {Array} gridIn 2D array of input weights
 * @param {Object} [options]
 * @param {bool} [options.diagonal] Specifies whether diagonal moves are allowed
 */
function Graph(gridIn, options) {
  options = options || {};
  this.nodes = [];
  this.diagonal = !!options.diagonal;
  this.grid = [];
  for (var x = 0; x < gridIn.length; x++) {
    this.grid[x] = [];

    for (var y = 0, row = gridIn[x]; y < row.length; y++) {
      var node = new GridNode(x, y, row[y]);
      this.grid[x][y] = node;
      this.nodes.push(node);
    }
  }
  this.init();
}

Graph.prototype.init = function() {
  this.dirtyNodes = [];
  for (var i = 0; i < this.nodes.length; i++) {
    astar.cleanNode(this.nodes[i]);
  }
};

Graph.prototype.cleanDirty = function() {
  for (var i = 0; i < this.dirtyNodes.length; i++) {
    astar.cleanNode(this.dirtyNodes[i]);
  }
  this.dirtyNodes = [];
};

Graph.prototype.markDirty = function(node) {
  this.dirtyNodes.push(node);
};

Graph.prototype.neighbors = function(node) {
  var ret = [];
  var x = node.x;
  var y = node.y;
  var grid = this.grid;

  // West
  if (grid[x - 1] && grid[x - 1][y]) {
    ret.push(grid[x - 1][y]);
  }

  // East
  if (grid[x + 1] && grid[x + 1][y]) {
    ret.push(grid[x + 1][y]);
  }

  // South
  if (grid[x] && grid[x][y - 1]) {
    ret.push(grid[x][y - 1]);
  }

  // North
  if (grid[x] && grid[x][y + 1]) {
    ret.push(grid[x][y + 1]);
  }

  if (this.diagonal) {
    // Southwest
    if (grid[x - 1] && grid[x - 1][y - 1]) {
      ret.push(grid[x - 1][y - 1]);
    }

    // Southeast
    if (grid[x + 1] && grid[x + 1][y - 1]) {
      ret.push(grid[x + 1][y - 1]);
    }

    // Northwest
    if (grid[x - 1] && grid[x - 1][y + 1]) {
      ret.push(grid[x - 1][y + 1]);
    }

    // Northeast
    if (grid[x + 1] && grid[x + 1][y + 1]) {
      ret.push(grid[x + 1][y + 1]);
    }
  }

  return ret;
};

Graph.prototype.toString = function() {
  var graphString = [];
  var nodes = this.grid;
  for (var x = 0; x < nodes.length; x++) {
    var rowDebug = [];
    var row = nodes[x];
    for (var y = 0; y < row.length; y++) {
      rowDebug.push(row[y].weight);
    }
    graphString.push(rowDebug.join(" "));
  }
  return graphString.join("\n");
};

function GridNode(x, y, weight) {
  this.x = x;
  this.y = y;
  this.weight = weight;
}

GridNode.prototype.toString = function() {
  return "[" + this.x + " " + this.y + "]";
};

GridNode.prototype.getCost = function(fromNeighbor) {
  // Take diagonal weight into consideration.
  if (fromNeighbor && fromNeighbor.x != this.x && fromNeighbor.y != this.y) {
    return this.weight * 1.41421;
  }
  return this.weight;
};

GridNode.prototype.isWall = function() {
  return this.weight === 0;
};

function BinaryHeap(scoreFunction) {
  this.content = [];
  this.scoreFunction = scoreFunction;
}

BinaryHeap.prototype = {
  push: function(element) {
    // Add the new element to the end of the array.
    this.content.push(element);

    // Allow it to sink down.
    this.sinkDown(this.content.length - 1);
  },
  pop: function() {
    // Store the first element so we can return it later.
    var result = this.content[0];
    // Get the element at the end of the array.
    var end = this.content.pop();
    // If there are any elements left, put the end element at the
    // start, and let it bubble up.
    if (this.content.length > 0) {
      this.content[0] = end;
      this.bubbleUp(0);
    }
    return result;
  },
  remove: function(node) {
    var i = this.content.indexOf(node);

    // When it is found, the process seen in 'pop' is repeated
    // to fill up the hole.
    var end = this.content.pop();

    if (i !== this.content.length - 1) {
      this.content[i] = end;

      if (this.scoreFunction(end) < this.scoreFunction(node)) {
        this.sinkDown(i);
      } else {
        this.bubbleUp(i);
      }
    }
  },
  size: function() {
    return this.content.length;
  },
  rescoreElement: function(node) {
    this.sinkDown(this.content.indexOf(node));
  },
  sinkDown: function(n) {
    // Fetch the element that has to be sunk.
    var element = this.content[n];

    // When at 0, an element can not sink any further.
    while (n > 0) {

      // Compute the parent element's index, and fetch it.
      var parentN = ((n + 1) >> 1) - 1;
      var parent = this.content[parentN];
      // Swap the elements if the parent is greater.
      if (this.scoreFunction(element) < this.scoreFunction(parent)) {
        this.content[parentN] = element;
        this.content[n] = parent;
        // Update 'n' to continue at the new position.
        n = parentN;
      }
      // Found a parent that is less, no need to sink any further.
      else {
        break;
      }
    }
  },
  bubbleUp: function(n) {
    // Look up the target element and its score.
    var length = this.content.length;
    var element = this.content[n];
    var elemScore = this.scoreFunction(element);

    while (true) {
      // Compute the indices of the child elements.
      var child2N = (n + 1) << 1;
      var child1N = child2N - 1;
      // This is used to store the new position of the element, if any.
      var swap = null;
      var child1Score;
      // If the first child exists (is inside the array)...
      if (child1N < length) {
        // Look it up and compute its score.
        var child1 = this.content[child1N];
        child1Score = this.scoreFunction(child1);

        // If the score is less than our element's, we need to swap.
        if (child1Score < elemScore) {
          swap = child1N;
        }
      }

      // Do the same checks for the other child.
      if (child2N < length) {
        var child2 = this.content[child2N];
        var child2Score = this.scoreFunction(child2);
        if (child2Score < (swap === null ? elemScore : child1Score)) {
          swap = child2N;
        }
      }

      // If the element needs to be moved, swap it, and continue.
      if (swap !== null) {
        this.content[n] = this.content[swap];
        this.content[swap] = element;
        n = swap;
      }
      // Otherwise, we are done.
      else {
        break;
      }
    }
  }
};

/**
 * Returns the points in the four cardinal directions around a single point if they exist.
 *
 * @param The point to check
 * @param The height of the board
 * @param The width of the board
 * @returns An point in an [X,Y] array
 */

var findAreaAroundPoint = function(point,height,width){
  var returnPoint = [];

  pointHolder = [point[0],point[1]];

  if (pointHolder[1]+1 < height){
    returnPoint.push([pointHolder[0],pointHolder[1]+1]);
  }
  if (pointHolder[1]-1 > 0){
     returnPoint.push([pointHolder[0],pointHolder[1]-1]);
  }
  if (pointHolder[0]+1 < width){
    returnPoint.push([pointHolder[0]+1,pointHolder[1]]);
  }
  if (pointHolder[0]-1 > 0){
  returnPoint.push([pointHolder[0]-1,pointHolder[1]]);
}
  return returnPoint;
}

/**
 * Takes in an array of points and returns an array of all surrounding points. May cause points to double.
 *
 * @param The array of points
 * @param The height of the board
 * @param The width of the board
 *
 * @returns An array of points
 */

var findAreasAroundCoorArray = function(coorArray,height,width){

  var returnPoint = [];

  for (var i = 0; i<coorArray.length;i++){
    returnPoint = returnPoint.concat(findAreaAroundPoint(coorArray[i],height,width));
  }

  return returnPoint;

}

/**
 * Loops through an array of [X,Y] coordinates and converts the corresponding node
 * on the graph to the provided priority.
 *
 * @param The graph of nodes
 * @param The array of coordinates
 * @returns A graph array
 */

var addArrayToGraph = function(graph,coorArray,priority){

    for (var i = 0; i< coorArray.length; i++){
        graph[coorArray[i][0]][coorArray[i][1]] = priority;
    }

    return graph;
}

var findHowManyFreeNodesV2 = function(point,graph){
  var start = [point[0],point[1]];
  var pointList = [[start[0],start[1]]];
  var pointRight = [];
  var pointLeft = [];
  var checkLeft = true;
  var checkRight = true;
  var count = 0;
  
  var graphCopy = [];
  
  for (var x = 0; x< graph.length; x++){
  	graphCopy.push([]);
    for (var y = 0; y<graph[x].length; y++){
    graphCopy[x].push(graph[x][y]);
    }
  }
  
  while (pointList.length > 0){
    var iterator = 0;
    var checkLeft = true;
    var checkRight = true;
    while (!isItAWall([pointList[0][0],pointList[0][1]+iterator-1],graphCopy)){
      iterator --;
    }
    while (!isItAWall([pointList[0][0],pointList[0][1]+iterator],graphCopy)){
      graphCopy[pointList[0][0]][pointList[0][1]+iterator] = 0;
      count ++;
      pointRight = [pointList[0][0]+1,pointList[0][1]+iterator];
      pointLeft = [pointList[0][0]-1,pointList[0][1]+iterator];
      if (checkRight && !isItAWall(pointRight,graphCopy)){
        pointList.push(pointRight);
        checkRight = false;
      }
      else if (isItAWall(pointRight,graphCopy)){
        checkRight = true;
      }
      if (checkLeft && !isItAWall(pointLeft,graphCopy)){
        pointList.push(pointLeft);
        checkLeft = false;
      }
      else if (isItAWall(pointLeft,graphCopy)){
        checkLeft = true;
      }
      iterator ++;
    }
    pointList.splice(0,1);
  }

  return count;
}

var removeDuplicates = function(arrayWithDuplicates){

  var arrayHolder = [];
  var different = false;

  for (var i = 0; i<arrayWithDuplicates.length; i++){
    different = true;
    for (var x = 0; x<arrayHolder.length; x++){
      if (arrayHolder[x][0] == arrayWithDuplicates[i][0] && arrayHolder[x][1] == arrayWithDuplicates[i][1]){
        different = false
      }
    }
    if (different){
      arrayHolder.push(arrayWithDuplicates[i]);
    }
  }

  return arrayHolder;

}
/**
 * Checks if a point is a wall by seeing if it falls out of bounds or if it's priority is equal to 0
 *
 * @param Point to check
 * @param The graph of nodes
 * @returns bool
 */

var isItAWall = function(point,graph){
    if (point[0] < 0 || point[1] < 0 || point[1] >= graph[0].length || point[0] >= graph.length || graph[point[0]][point[1]] == 0){
      return true;
    }
    return false;
}

/**
 * Return the movement vector between two body parts.
 *
 * @param bodyPart1
 * @param bodyPart2
 * @returns {[*,*]}
 */
var getMoveVector = function(bodyPart1,bodyPart2){
  return [bodyPart1[0] - bodyPart2[0], bodyPart1[1] - bodyPart2[1]];
};

/**
 * Return the distance between two points.
 *
 * @param point1
 * @param point2
 * @returns {number}
 */

var getDistance = function(point1,point2){
  return Math.abs(point1[0] - point2[0]) + Math.abs(point1[1] - point2[1]);
};


/**
 * Checks if an array of points are in tunnels by looping through the isPointInTunnel() function.
 *
 * @param An array of points
 * @param The graph of nodes
 *
 * @returns Array of points in tunnels
 */

var checkIfPointsAreTunnels = function(points,graph){

  var pointHolder = [];

  for (var i =0; i<points.length;i++){
    if (isPointInTunnel(points[i],graph)){
      pointHolder.push(points[i]);
    }
  }
  return pointHolder;
}

/**
 * Checks if a point is in a tunnel by looking at the surrounding blocks. A point is in a tunnel if
 * it is covered on two opposite sides exactly and is empty.
 *
 * @param The point to check
 * @param The graph of nodes
 * @returns bool
 */

var isPointInTunnel = function(point,graph,isHead){

    isHead = isHead || false;

    if (isItAWall(point,graph) && !isHead){
      return false;
    }

    var directions = [[point[0],point[1]-1],[point[0],point[1]+1],[point[0]+1,point[1]],[point[0]-1,point[1]]];
    var horizontalCovered = 0;
    var verticalCovered = 0;

    for (var i = 0; i< directions.length; i++){
      if (isItAWall(directions[i],graph)){
        if (i < 2){
          verticalCovered ++;
        }
        else {
          horizontalCovered ++;
        }
      }
    }

    if ((verticalCovered == 2 && horizontalCovered == 0) || (verticalCovered == 0 && horizontalCovered == 2)){
      return true;
    }
    return false;

}

/**
 * Finds all the areas around walls by comparing their priority to the priority of the wall.
 *
 * @param The graph full of nodes
 *
 * @param The wall priority to check against
 * @returns array
 */

var findAreasAroundWalls = function(graph,wallPriority){
  var arrayOfSpots = [];

    for (var x = 0; x< graph.length; x++){
      for (var y = 0; y<graph[x].length; y++){
        if (graph[x][y] == wallPriority){
          arrayOfSpots.push([x,y]);
        }
      }
  }
  return arrayOfSpots;
}

var findPointsInDanger = function(graph,head){
  var graphPoints = [];
  
  for (var x = 0; x < graph.length; x++){
    for (var y = 0; y < graph[x].length; y++){
      if (isPointInDanger([x,y],graph) >= 3 && (x != head[0] && y != head[1])){
        graphPoints.push([x,y]);
      }
    }
  }

  return graphPoints;
}

/**
 * Finds out how many points are full around a single point
 *
 * @param The point to check
 * @param The graph full of nodes
 *
 * @returns int
 */

var isPointInDanger = function(point,graph,returnArrayBool){

  returnArrayBool = returnArrayBool || false;

  var pointsToCheck = [[point[0]+1,point[1]],[point[0]-1,point[1]],[point[0],point[1]+1],[point[0],point[1]-1]];
  var dangerLevel = 0;
  var returnArray = [];

  for(var i = 0; i<pointsToCheck.length;i++){
    if (isItAWall(pointsToCheck[i],graph)){
      dangerLevel ++;
    }
    else if (returnArrayBool){
      returnArray.push(pointsToCheck[i]);
    }
  }

  if (returnArrayBool){
    return returnArray
  }
  return dangerLevel;
}

var getWeightByCoordinates = function(graphObject,x,y,width,height){
  if(x < 0 || y < 0 || x > width - 1 || y > height - 1){
    return 0;
  }else{
    return parseInt(graphObject.grid[x][y].weight);
  }
};

/**
 * Displays the node graph, oriented properly, in the console.
 * 
 * @param The graph of nodes
 * @returns null
 */

var displayGraph = function(graph){
  var graphHolder = [];

  for (var i = 0; i< graph.length; i++){
    graphHolder.push([0]);
  }

  for (var y = 0; y < graph.length; y++){
     for (var x = 0; x < graph[y].length; x++){
      graphHolder[y][x] = graph[x][y];
     }
  }

  console.log(graphHolder);

}

/**
 * The basic function that calls A* multiple times to try and figure out the best path.
 *
 * @param The width of the board [int]
 * @param The height of the board [int]
 * @param The goals on the board, with most important on the bottom [array]
 * @param The other snakes on the board [array of arrays]
 * @param Our snake's body [array]
 * @param An array of points that will disappear by the time our snake reaches them
 * @param The current health of our snake [int]
 *
 * @returns The point for the next move
 */

function findShortestPathWithLevels(width,height,goals,badSnakes,ownBody,thingsThatWillDisappear,health,snakeHeads){
    var graph = [];
    var nextPoint = [];
    var pathLength = 1000;
    var spotsThatMightBeInATunnel = [];
    var head = [ownBody[0][0],ownBody[0][1]];
    ownBody.splice(0,1);

    var priority = {"empty": 2, "full": 0, "nearSelf": 1, "nearOthers": 3, "nearWalls": 3, "ownBody": 0, "tunnel": 0, "danger": 0};
    for(var x = 0; x < width; x++){
        var row = [];
        for (var y = 0; y < height; y++){
            if (x == 0 || x == width-1 || y == 0 || y == height-1){
                row.push(priority.nearWalls)
            }
            else {
                row.push(priority.empty);
            }
        }
        graph.push(row);
    }

    var ownTail = ownBody[ownBody.length - 1];

    var areaAroundOtherSnakes = findAreasAroundCoorArray(badSnakes,height,width);
    var areaAroundSelf = findAreasAroundCoorArray(ownBody,height,width);
    var areaAroundWalls = findAreasAroundWalls(graph,priority.nearWalls);
    var areaAroundSnakeHeads = findAreasAroundCoorArray(snakeHeads,height,width);

    //spotsThatMightBeInATunnel = spotsThatMightBeInATunnel.concat(areaAroundSelf);
    //spotsThatMightBeInATunnel = spotsThatMightBeInATunnel.concat(areaAroundOtherSnakes);
    //spotsThatMightBeInATunnel = spotsThatMightBeInATunnel.concat(areaAroundWalls);

    graph = addArrayToGraph(graph,areaAroundSelf,priority.nearSelf);
    graph = addArrayToGraph(graph,areaAroundOtherSnakes,priority.nearOthers);
    graph = addArrayToGraph(graph,ownBody,priority.ownBody);
    graph = addArrayToGraph(graph,badSnakes,priority.full);
    graph = addArrayToGraph(graph,areaAroundSnakeHeads,priority.full);

    // if (health < 10 + ownBody.length || isPointInTunnel(head,graph,true)){
    //   console.log("In tunnel!");
    //   priority.tunnel = 20;
    //   priority.danger = 90;
    // }


    var pointsInDanger = findPointsInDanger(graph,head);
    graph = addArrayToGraph(graph,pointsInDanger,priority.danger);

    //spotsThatMightBeInATunnel = checkIfPointsAreTunnels(spotsThatMightBeInATunnel,graph);
    //graph = addArrayToGraph(graph,spotsThatMightBeInATunnel,priority.tunnel);

    // graph = addArrayToGraph(graph,thingsThatWillDisappear,priority.empty);
    graph = addArrayToGraph(graph,goals,priority.empty);

    // console.log([head[0]-1,head[1]]);
    // console.log(isPointInDanger([head[0]-1,head[1]],graph,true));

    console.log(findHowManyFreeNodesV2(head,graph));

    var graphObject = new Graph(graph);

    var start = graphObject.grid[head[0]][head[1]];

    for (var i = 0; i<goals.length;i++){

      var end = graphObject.grid[goals[i][0]][goals[i][1]];
      var result = astar.search(graphObject,start,end);

      if (result.length < pathLength && result.length > 0){

        nextPoint = [result[0].x,result[0].y];
        pathLength = result.length;
      }
    }

    if(nextPoint.length == 0){
      console.log("Stalling!");

      //Get vector total of last 2 moves.

      var lastMoveVector = getMoveVector(head,ownBody[0]),
          secondLastMoveVector = getMoveVector(ownBody[0],ownBody[1]),
          vectorTotal = [lastMoveVector[0] + secondLastMoveVector[0], lastMoveVector[1] + secondLastMoveVector[1]],
          sameDirectionMove = [head[0] + lastMoveVector[0],head[1] + lastMoveVector[1]];

      // CASE 1: If last two moves were an elbow
      if(vectorTotal[0] != 0 && vectorTotal[1] != 0){
        var doubleBackVector = [secondLastMoveVector[0] * -1, secondLastMoveVector[1] * -1],
            doubleBackMove = [head[0] + doubleBackVector[0], head[1] + doubleBackVector[1]];

        //CASE 1.1: Can we double back?
        if(getWeightByCoordinates(graphObject,doubleBackMove[0],doubleBackMove[1],width,height) > 0){
          nextPoint = doubleBackMove;
        }
        //CASE 1.2: If not, try to move in same direction
        else if(getWeightByCoordinates(graphObject,sameDirectionMove[0],sameDirectionMove[1],width,height) > 0){
          nextPoint = sameDirectionMove;
        }
        //CASE 1.3: If we can't move in the same direction, go in the only possible direction.
        else {
          nextPoint = [(lastMoveVector[0] + (lastMoveVector[0] * -1) + doubleBackVector[0]) * -1,(lastMoveVector[1] + (lastMoveVector[1] * -1) + doubleBackVector[1]) *-1];
        }
      }
      //CASE 2: Last two moves were the same.
      else{   
        var wasVertical = lastMoveVector[0] == 0,
            backupVectors = wasVertical ? [[-1,0],[1,0]] : [[0,-1],[0,1]];
        //CASE 2.1: Can we go straight?
        if(getWeightByCoordinates(graphObject,sameDirectionMove[0],sameDirectionMove[1],width,height) > 0){
          nextPoint = sameDirectionMove;
        }else{
          //CASE 2.2: Backup moves.
          var backupMove1 = [head[0] + backupVectors[0][0],head[1] + backupVectors[0][1]],
              backupMove2 = [head[0] + backupVectors[1][0],head[1] + backupVectors[1][1]],
              backupDistance1 = getDistance(ownTail,backupMove1),
              backupDistance2 = getDistance(ownTail,backupMove2),
              firstToCheck = backupDistance1 > backupDistance2 ? backupMove2 : backupMove1,
              secondToCheck = backupDistance1 > backupDistance2 ? backupMove1 : backupMove2;

          if(getWeightByCoordinates(graphObject,firstToCheck[0],firstToCheck[1],width,height) > 0){
            nextPoint = firstToCheck;
          } else {
            nextPoint = secondToCheck;
          }

        }

      }
    }

    return nextPoint;

}

// javascript-astar 0.4.1
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

var astarSnakes = {

    astarSnake: function(width,height,food,badSnakes,ownBody,thingsThatWillDisappear,health,snakeHeads){
        return findShortestPathWithLevels(width,height,food,badSnakes,ownBody,thingsThatWillDisappear,health,snakeHeads);
    }

}

module.exports = astarSnakes;