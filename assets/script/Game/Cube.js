var cube = Fire.defineComponent();

cube.prototype.clear = function () {
    this.entity.destroy();
};

cube.prototype.test = function () {
    console.log('test');
};

module.exports = cube;
