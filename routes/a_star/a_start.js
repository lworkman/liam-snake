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

var findAreasAroundBody = function(body,height,width){
  var returnPoint = [];

  for (var i = 0; i<body.length;i++){
    returnPoint = returnPoint.concat(findAreaAroundPoint(body[i],height,width));
  }

  return returnPoint;

}

var addArrayToGraph = function(graph,gridArray,priority){

    var holderGraph = graph;

    setPriority = priority;

    for (var i = 0; i< gridArray.length; i++){

        holderGraph[gridArray[i][1]][gridArray[i][0]] = setPriority;
    }

    return holderGraph;
}

var isItAWall = function(point,graph){
  console.log(point);
    if (point[0] < 0 || point[1] < 0 || point[1] >= graph.length || point[0] >= graph[0].length || graph[point[1]][point[0]] == 0){
      return true;
    }
    return false;
}


var checkIfPointWithDirectionBlocked = function(point,direction,graph){

  var pointToCheck = [];

  switch(direction){
      case "up":
        pointToCheck[0] = point[0];
        pointToCheck[1] = point[1]-1;
        break;
      case "right":
        pointToCheck[0] = point[0]+1;
        pointToCheck[1] = point[1];
        break;
      case "down":
        pointToCheck[0] = point[0];
        pointToCheck[1] = point[1]+1;
        break;
      case "left":
        pointToCheck[0] = point[0]-1;
        pointToCheck[1] = point[1];
        break;
    }

  if (pointToCheck[0] < 0 || pointToCheck[1] < 0 || pointToCheck[0] == graph[0].length || pointToCheck[1] == graph.length){
    return true;
  }

  if (graph[pointToCheck[1]][pointToCheck[0]] == 0){
    return true;
  }
  return false;
}

function findShortestPathWithLevels(width,height,head,food,badSnakes,ownBody,thingsThatWillDisappear,health){
    var graph = [];
    var nextPoint = [];
    var pathLength = 1000;
    var spotsThatMightBeInATunnel = [];
    ownBody.splice(0,1);

    var priority = {"empty": 2, "full": 0, "nearSelf": 1, "nearOthers": 3, "nearWalls": 10, "ownBody": 0, "tunnel": 20};
    for(var y = 0; y < height; y++){
        var row = [];
        for (var x = 0; x < width; x++){
            if (x == 0 || x == width-1 || y == 0 || y == height-1){
                row.push(priority.nearWalls)
            }
            else {
                row.push(priority.empty);
            }
        }
        graph.push(row);
    }

    var areaAroundOtherSnakes = findAreasAroundBody(badSnakes,height,width);
    var areaAroundSelf = findAreasAroundBody(ownBody,height,width);
    var areaAroundWalls = findAreasAroundWalls(graph,priority.nearWalls);

    spotsThatMightBeInATunnel = spotsThatMightBeInATunnel.concat(areaAroundSelf);
    spotsThatMightBeInATunnel = spotsThatMightBeInATunnel.concat(areaAroundOtherSnakes);
    spotsThatMightBeInATunnel = spotsThatMightBeInATunnel.concat(areaAroundWalls);

    graph = addArrayToGraph(graph,areaAroundSelf,priority.nearSelf);
    graph = addArrayToGraph(graph,areaAroundOtherSnakes,priority.nearOthers);
    graph = addArrayToGraph(graph,ownBody,priority.ownBody);
    graph = addArrayToGraph(graph,badSnakes,priority.full);

    if (health < 30 + ownBody.length || isPointInTunnel(head,graph)){
      priority.tunnel = 20;
    }

    spotsThatMightBeInATunnel = checkIfPointsAreTunnels(spotsThatMightBeInATunnel,graph);
    graph = addArrayToGraph(graph,spotsThatMightBeInATunnel,priority.tunnel);

    graph = addArrayToGraph(graph,thingsThatWillDisappear,priority.empty);

    console.log(isPointInDanger(head,graph));

    var graphObject = new Graph(graph);

    var start = graphObject.grid[head[1]][head[0]];

    for (var i = 0; i<food.length;i++){

      var end = graphObject.grid[food[i][1]][food[i][0]];
      var result = astar.search(graphObject,start,end);

      if (result.length < pathLength && result.length > 0){

        nextPoint = [result[0].y,result[0].x];
        pathLength = result.length;
      }
    }

    graph = addArrayToGraph(graph,spotsThatMightBeInATunnel,priority.empty);

    var graphObject = new Graph(graph);

    var start = graphObject.grid[head[1]][head[0]];

    for (var i = 0; i<food.length;i++){

      var end = graphObject.grid[food[i][1]][food[i][0]];
      var result = astar.search(graphObject,start,end);

      if (result.length < pathLength && result.length > 0){

        nextPoint = [result[0].y,result[0].x];
        pathLength = result.length;
      }
    }

    if(nextPoint.length == 0){
      console.log("Stalling!");

      graphObject = new Graph(graph);   

      //Stall - Find shortest path to furthest point on own body.
      var stallNext = [], stallPoint, stallPath;
      for(var index in areaAroundSelf){
        if(areaAroundSelf.hasOwnProperty(index)){

          //When stalling we always want to be doubling back on ourselves. In this case we want to find the shortest path
          //to the furthest reachable node that is beside our own snake.
          stallPoint = areaAroundSelf[index];
          stallPath = astar.search(graphObject,start,graphObject.grid[stallPoint[1]][stallPoint[0]]);
          if(stallPath.length > 0){
            stallNext = [stallPath[0].y, stallPath[0].x];

          }else if(stallNext.length > 0){
            nextPoint = stallNext;
            break;
          }
        }
      }
    }

    return nextPoint;

}

var checkIfPointsAreTunnels = function(points,graph){
  var pointHolder = [];

  for (var i =0; i<points.length;i++){
    if (isPointInTunnel(points[i],graph) && !isItAWall(points[i],graph)){
      pointHolder.push(points[i]);
    }
  }
  return pointHolder;
}

var isPointInTunnel = function(point,graph){

    var directions = ["up","down","left","right"];
    var horizontalCovered = 0;
    var verticalCovered = 0;

    for (var i = 0; i< directions.length; i++){
      if (checkIfPointWithDirectionBlocked(point,directions[i],graph)){
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

var findAreasAroundWalls = function(graph,wallPriority){
  var arrayOfSpots = [];

    for (var y = 0; y< graph.length; y++){
      for (var x = 0; x<graph[y].length; x++){
        if (graph[y][x] == wallPriority){
          arrayOfSpots.push([x,y]);
        }
      }
  }
  return arrayOfSpots;
}

//Finds out how many squares around a point are full (max 8)

var isPointInDanger = function(point,graph){

  var pointsToCheck = [[point[0]+1,point[1]],[point[0]-1,point[1]],[point[0],point[1]+1],[point[0],point[1]-1],[point[0]+1,point[1]+1],[point[0]-1,point[1]+1],[point[0]-1,point[1]-1],[point[0]+1,point[1]+1]];
  var dangerLevel = 0;

  for(var i = 0; i<pointsToCheck.length;i++){
    console.log(pointsToCheck[i]);
    if (isItAWall(pointsToCheck[i],graph)){
      dangerLevel ++;
    }
  }

  return dangerLevel;
}

// javascript-astar 0.4.1
// http://github.com/bgrins/javascript-astar
// Freely distributable under the MIT License.
// Implements the astar search algorithm in javascript using a Binary Heap.
// Includes Binary Heap (with modifications) from Marijn Haverbeke.
// http://eloquentjavascript.net/appendix2.html

var astarSnakes = {

    astarSnake: function(width,height,head,food,badSnakes,ownBody,thingsThatWillDisappear,health){
        return findShortestPathWithLevels(width,height,head,food,badSnakes,ownBody,thingsThatWillDisappear,health);
    }

}

module.exports = astarSnakes;