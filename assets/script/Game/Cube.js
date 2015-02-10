var cube = Fire.defineComponent();

cube.prop("_clear", false, Fire.HideInInspector);

cube.getset("clear",
function() {
    return this._clear;
},

function(value) {
    this._clear = value;
    this.Clear();
});

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

cube.prototype.Clear = function() {
    this.entity.destroy();
};

module.exports = cube;