var cube = Fire.defineComponent(function() {
    this.stopAnimation = true;
});

cube.prop('_position', new Fire.Vec2(0, 0), Fire.HideInInspector);
cube.prop('_destroy', false, Fire.HideInInspector);

cube.getset('destroy',
function() {
    return this._destroy;
},
function(value) {
    if (value !== this._destroy) {
        this._destroy = value;
    }
    if (value) {
        this.playAnimation();
    }
});

// 单个cube的相对坐标
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

cube.prototype.playAnimation = function() {
    this.stopAnimation = false;
};

// 单个cube的消失动画
cube.prototype.animation = function() {
    this.entity.transform.scale = new Fire.Vec2(this.entity.transform.scale.x - Fire.Time.deltaTime * 5, this.entity.transform.scale.x - Fire.Time.deltaTime * 5);
    if (this.entity.transform.scale.x - Fire.Time.deltaTime <= 0) {
        this.stopAnimation = true;
        this.clear();
    }
};

cube.prototype.update = function() {
    if (!this.stopAnimation) {
        this.animation();
    }
};

module.exports = cube;
