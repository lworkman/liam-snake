var extraFunctions = {
  ourSnakeID: '',

  // Moves randomly
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
  // Moves up and right in a zig-zag, no matter what
  dumbSnake: function (ourSnakeCoordinates) {
    if (ourSnakeCoordinates[0][0] < ourSnakeCoordinates[1][0]) {
      return 'right';
    }
    else {
      return 'up';
    }
  },

  findOurSnakeFromArray: function (snakeObj) {
    return snakeObj.id == extraFunctions.ourSnakeID;
  }

};

module.exports = extraFunctions;