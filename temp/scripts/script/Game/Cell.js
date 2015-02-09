Fire._RFpush('18c5b355fc6d494a8a4b4ea4a5d932f8', 'Cell');
// script\Game\Cell.js

var Cell = Fire.defineComponent();

Cell.prop('pos', new Vec2(0, 0));
Cell.prop('hasCube', false);

Cell.prototype.clean = function() {
    this.entity.destroy();
};

Cell.prototype.setPos = function(x, y) {
    this.pos = new Vec2(x, y);
};

Cell.prototype.setCube = function(cube){
    cube.parent = this.entity;
    cube.transform.position = new Vec2(0, 0);
	this.hasCube = true;
};

Cell.prototype.onLoad = function() {
    //-- 绑定Cube销毁消息
};

module.exports = Cell;

Fire._RFpop();