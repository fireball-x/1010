var Cell = require('Cell');

var Board = Fire.defineComponent(function () {
    this._area = new Fire.Rect(0, 0, 0, 0);
    this._tempGrid = null;
    this._board = [];
});

Board.prop("grid", null, Fire.ObjectType(Fire.Entity));

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
    if(this._board.length > 0){
        return;
    }
    if (!this._tempGrid) {
        this._tempGrid = this.entity.find('../Prefabs/Cube');
    }
    this._area = new Fire.Rect(0, 0, 0, 0);
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
            cell.setPos(x, y);
            this._board[x][y] = cell;
            if (x === 0 && y === 0) {
                this._area.x = cell.transform.position.x;
                this._area.y = cell.transform.position.y;
            }
            if (x === this.count.x - 1 && y === this.count.y - 1) {
                this._area.width = Math.abs(this._area.x - cell.transform.position.x);
                this._area.height = Math.abs(this._area.y - cell.transform.position.y);
            }
        }
    }
};

//-- 清空棋盘
Board.prototype.clean = function () {
    var len = 0;
    for (var x = 0, len = this.count.x; x < len; x++) {
        for (var y = 0, len = this.count.y; y < len; y++) {
            this._board[x][y].entity.destroy();
            Fire.FObject._deferredDestroy();
        }
    }
    this._board = [];
};

//--  通过X Y 获取Cell（X 0-9）(Y 0-9)
Board.prototype.getCell = function (x, y) {
    return this._board[x][y];
};

//-- 判断是否可以在格子上放置方块
Board.prototype.canPutCubeToCell = function (cube) {




    return true;
};




