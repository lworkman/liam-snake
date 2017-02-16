module.exports = {
  randoSnake: function () {
    var rand = Math.floor((Math.random() * 4) + 1);

    switch(rand){
        case 1:
        return 'up';
        case 2:
        return 'right';
        case 3:
        return 'down';
        case 4:
        return 'left';
    }
  }
};