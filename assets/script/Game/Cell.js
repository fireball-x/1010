var Cell = Fire.extend(Fire.Component);

Cell.prop('offset', new Fire.Vec2(0, 0));
Cell.prop('hasCube', false);
Cell.prop('cube', null, Fire.HideInInspector);
Cell.prop('readyClear', false, Fire.HideInInspector);

Cell.prototype.clean = function() {
    this.entity.destroy();
};

Cell.prototype.putCube = function (cube) {
    cube.entity.parent = this.entity;
    cube.transform.position = new Fire.Vec2(0, 0);
    this.hasCube = true;
    this.cube = cube;

    //-- 绑定已经放置方块消息
    this.entity.dispatchEvent(new Fire.Event("putCube", true));
    //-- 绑定Cube销毁消息
    this.entity.on("curb clear", function () {
        this.hasCube = false;
        this.readyClear = false;
        this.cube = null;
    }.bind(this));
};

Cell.prototype.removeCube = function () {
    var Cube = require('Cube');
    this.readyClear = true;
    this.cube.entity.getComponent(Cube).playAnimation();
};
