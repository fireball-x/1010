Fire._RFpush('1d5f53c190754efab76db34d6032ea99', 'Cell');
// script/Game/Cell.js

var Cell = Fire.defineComponent();

Cell.prop('offset', new Fire.Vec2(0, 0));
Cell.prop('hasCube', false);
Cell.prop('cube', null, Fire.HideInInspector);

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
        this.cube = null;
        this.hasCube = false;
    }.bind(this));
};

module.exports = Cell;

Fire._RFpop();