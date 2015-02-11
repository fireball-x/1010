var Cell = Fire.defineComponent();

Cell.prop('offset', new Fire.Vec2(0, 0));
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
    
    //-- 绑定Cube销毁消息
    this.entity.once("curb clear", function () {
        this._cube = null;
        this.hasCube = false;
    });
};

Cell.prototype.onLoad = function() {
   
};

module.exports = Cell;
