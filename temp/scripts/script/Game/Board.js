Fire._RFpush('08c0f5f70d6b4b0aa8a4eebc4b45279b', 'Board');
// script/Game/Board.js

var Cell = require('Cell');
var Cube = require('Cube');

var Board = Fire.defineComponent(function () {
    this._tempGrid = null;
});

Board.prop("_board", [], Fire.HideInInspector);

Board.prop("grid", null, Fire.ObjectType(Fire.Entity), Fire.HideInInspector);

Board.prop("count", new Fire.Vec2(10, 10));

Board.prop("size", new Fire.Vec2(30, 30));

Board.prop("spacing", 2, Fire.Integer);

Board.prop("_createOrClean", false, Fire.HideInInspector);
Board.getset("createOrClean",
    function () { return this._createOrClean; },
    function (value) {
        if (value != this._createOrClean) {
            this._createOrClean = value;
            if (this._createOrClean) {
                this.create();
            }
            else {
                this.clean();
            }
        }
});

//-- 创建棋盘格子
Board.prototype.create = function () {
    if (this._board.length > 0) {
        return;
    }
    if (!this._tempGrid) {
        this._tempGrid = this.entity.find('../Prefabs/Cube');
    }
    var widthX = (this.size.x + this.spacing);
    var widthY = (this.size.y + this.spacing);
    for (var x = 0, len = this.count.x; x < len; ++x) {
        this._board[x] = [];
        for (var y = 0, len = this.count.y; y < len; ++y) {
            var entity = Fire.instantiate(this._tempGrid);
            entity.parent = this.entity;
            entity.name = x + ":" + y;
            //var startPosX = ((widthX * this.count.x) / 2) - (widthX / 2);
            //var startPosY = ((widthY * this.count.y) / 2) - (widthY / 2);
            entity.transform.position = new Fire.Vec2(x * widthX, y * widthY);
            var renderer = entity.getComponent(Fire.SpriteRenderer);
            renderer.color = new Fire.Color(85 / 255, 85 / 255, 85 / 255, 1);
            var cell = entity.addComponent(Cell);
            cell.offset = new Fire.Vec2(x, y);
            this._board[x][y] = cell;
        }
    }    
    this._createOrClean = true;
};

//-- 清空棋盘
Board.prototype.clean = function () {
    var len = 0;
    for (var x = 0, len = this.count.x; x < len; x++) {
        for (var y = 0, len = this.count.y; y < len; y++) {
            if(this._board[x][y]){
            	this._board[x][y].entity.destroy();
            	//Fire.FObject._deferredDestroy();
            }
        }
    }
    this._board = [];
    this._createOrClean = false;
};

//--  通过X Y 获取Cell（X 0-9）(Y 0-9)
Board.prototype.getCell = function (x, y) {
    if (x > -1 && x < 10 && y > -1 && y < 10) {
        return this._board[x][y];
    }
    return null;
};

//-- 判断是否可以在格子上放置方块
Board.prototype.canPutCubeToCell = function (cubeGroup, center) {
    for (var j = 0, len = cubeGroup._children.length; j < len; j++) {
        var cube = cubeGroup._children[j].getComponent(Cube);
        var pos = cube.position;
        var cell = this.getCell(center.x + pos.x, center.y + pos.y);
        if (!cell || cell.hasCube) {
            return false;
        }
    }
    return true;
};

module.exports = Board;

Fire._RFpop();