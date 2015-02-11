var Cell = Fire.defineComponent();

Cell.prop('pos', new Fire.Vec2(0, 0));
Cell.prop('hasCube', false);
Cell.prop('_cube', null, Fire.HideInInspector);

Cell.prototype.clean = function() {
    this.entity.destroy();
};

Cell.prototype.putCube = function (cube) {
    cube.entity.parent = this.entity;
    cube.transform.position = new Fire.Vec2(0, 0);
    this.hasCube = true;
    this._cube = cube;
};

Cell.prototype.onLoad = function() {
    //-- 绑定Cube销毁消息
    this.entity.on("cube destroyed", function () {
        this._cube = null;
        this.hasCube = false;
    });
};

module.exports = Cell;
