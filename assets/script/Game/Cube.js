var cube = Fire.defineComponent();

cube.prop('_position', new Fire.Vec2(0, 0), Fire.HideInInspector);

cube.getset('position',
function() {
    return this._position;
},
function(value) {
    if (value != this._position) {
        this._position = value;
    }
});

cube.prototype.clear = function() {
    this.entity.dispatchEvent(new Fire.Event("curb clear", true));
    this.entity.destroy();
};

module.exports = cube;