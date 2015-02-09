var Cell = require('Cell');

var Board = Fire.defineComponent(function () {
    this._tempGrid = null;
    this._board = [];
});

Board.prop("grid", null, Fire.ObjectType(Fire.Entity));

Board.prop("count", new Vec2(10, 10));

Board.prop("size", new Vec2(30, 30));

Board.prop("spacing", 2, Fire.Integer);

Board.prototype.initBoard = function () {
    this._board = [];
    if (!this._tempGrid) {
        this._tempGrid = this.entity.find('../Prefabs/Cube');
    }
    for (var x = 0, len = this.count.x; x < len; ++x) {
        this._board[x] = [];
        for (var y = 0, len = this.count.y; y < len; ++y) {
            var entity = Fire.instantiate(this._tempGrid);
            entity.parent = this.entity;
            entity.name = x + ":" + y;
            var widthX = (this.size.x + this.spacing);
            var widthY = (this.size.y + this.spacing);
            var startPosX = ((widthX * this.count.x) / 2) - (this.size.x / 2);
            var startPosY = ((widthY * this.count.y) / 2) - (this.size.y / 2);
            entity.transform.position = new Vec2(-startPosX + x * widthX, startPosY - y * widthY);
            var renderer = entity.getComponent(Fire.SpriteRenderer);
            renderer.color = new Fire.Color(85 / 255, 85 / 255, 85 / 255, 1);
            var cell = entity.addComponent(Cell);
            cell.setPos(x, y);
            this._board[x][y] = cell;
        }
    }
};

Board.prototype.onLoad = function () {
    this.initBoard();
};

