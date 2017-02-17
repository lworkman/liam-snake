var extraFunctions = {

  ourSnakeID: '',

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
   * @returns {*}
   */
  dumbSnake: function (ourSnakeCoordinates) {
    if (ourSnakeCoordinates[0][0] < ourSnakeCoordinates[0][1]) {
      return 'right';
    }
    else {
      return 'up';
    }
  },

  //=========================
  // HELPER FUNCTIONS
  //=========================
  /**
   * Function used by find() on the array of snakes pass on POST /move to get OUR snake object from the list.
   *
   * Given a snake object, return true if that snake's ID is ours.
   *
   * @param snakeObj
   * @returns {boolean}
   */
  findOurSnakeFromArray: function (snakeObj) {
    return snakeObj.id == extraFunctions.ourSnakeID;
  }

};

module.exports = extraFunctions;