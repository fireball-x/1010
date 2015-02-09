Fire._RFpush('905cdd41ec07405c8334cd28b309736a', 'Cube');
// script/Game/Cube.js

var cube = Fire.defineComponent();

cube.prototype.clear = function () {
    this.entity.destroy();
};

cube.prototype.test = function () {
    console.log('test');
};

module.exports = cube;

Fire._RFpop();