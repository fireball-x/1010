var Cell = require('Cell');
var Cube = require('Cube');

var Board = Fire.Class({
    // 继承
    extends: Fire.Component,
    //
    constructor: function() {
        this._tempGrid = null;
        this.delCubeRowList = [];
        this.delCubeColList = [];
        this._board = [];
        this.grid = null;
    },
    // 属性
    properties:{
        count: {
            default: new Fire.Vec2(10, 10),
            type: Fire.Vec2
        },

        size : {
            default: new Fire.Vec2(30, 30),
            type   : Fire.Vec2
        },

        spacing: 2,

        _createOrClean: {
            default: false,
            visible: false
        },

        createOrClean: {
            get: function () {
                return this._createOrClean;
            },
            set: function (value) {
                if (value != this._createOrClean) {
                    this._createOrClean = value;
                    if (this._createOrClean) {
                        this.create();
                    }
                    else {
                        this.clean();
                    }
                }
            }
        }
    },
    // 创建棋盘格子
    create: function() {
        this._board = [];

        if (!this._tempGrid) {
            this._tempGrid = Fire.Entity.find('/Prefabs/cube');
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
//             renderer.color = new Fire.Color(115 / 255, 115 / 255, 115 / 255, 1);
                var cell = entity.addComponent(Cell);
                cell.offset = new Fire.Vec2(x, y);
                this._board[x][y] = cell;
            }
        }
        this._createOrClean = true;
    },
    //
    onLoad: function() {
        //-- 判断行是否可以消除
        this.entity.on("putCube", function (event) {
            var cell = event.target.getComponent(Cell);
            this.delLine(cell);
        }.bind(this));
    },
    //
    delLine: function(cell) {
        var clearRow = true, clearCol = true;
        var tempCell = null;
        var x = 0, y = 0;
        var tempDelCubeRowList = []
        var tempDelCubeColList = []
        for (x = cell.offset.x; x >= 0; --x) {
            tempCell = this.getCell(x, cell.offset.y);
            if (!tempCell.hasCube) {
                clearRow = false;
                break;
            }
            else {
                tempDelCubeRowList.push(tempCell);
            }
        }
        if (clearRow) {
            for (x = cell.offset.x; x < this.count.x; ++x) {
                tempCell = this.getCell(x, cell.offset.y);
                if (!tempCell.hasCube) {
                    clearRow = false;
                    break;
                }
                else {
                    tempDelCubeRowList.push(tempCell);
                }
            }
        }
        for (y = cell.offset.y; y >= 0; --y) {
            tempCell = this.getCell(cell.offset.x, y);
            if (!tempCell.hasCube) {
                clearCol = false;
                break;
            }
            else {
                tempDelCubeColList.push(tempCell);
            }
        }
        if (clearCol) {
            for (y = cell.offset.y; y < this.count.y; ++y) {
                tempCell = this.getCell(cell.offset.x, y);
                if (!tempCell.hasCube) {
                    clearCol = false;
                    break;
                }
                else {
                    tempDelCubeColList.push(tempCell);
                }
            }
        }

        if (clearRow) {
            this.delCubeRowList.push(tempDelCubeRowList);
        }
        if (clearCol) {
            this.delCubeColList.push(tempDelCubeColList);
        }
    },
    // 清空棋盘
    clean: function() {
        var len = 0;
        for (var x = 0, len = this.count.x; x < len; ++x) {
            for (var y = 0, len = this.count.y; y < len; ++y) {
                if(this._board[x][y]){
                    this._board[x][y].entity.destroy();
                    if (!Fire.Engine.isPlaying) {
                        Fire.FObject._deferredDestroy();
                    }
                }
            }
        }
        this._board = [];
        this._createOrClean = false;
    },
    // 通过X Y 获取Cell（X 0-9）(Y 0-9)
    getCell: function(x, y) {
        if (x > -1 && x < 10 && y > -1 && y < 10) {
            return this._board[x][y];
        }
        return null;
    },
    // 判断是否可以在格子上放置方块
    canPutCubeToCell: function(cubeGroup, center) {
        for (var j = 0, len = cubeGroup._children.length; j < len; ++j) {
            var cube = cubeGroup._children[j].getComponent(Cube);
            if (!cube) {
                continue;
            }
            var pos = cube.position;
            var cell = this.getCell(center.x + pos.x, center.y + pos.y);
            if (!cell || (cell.hasCube && !cell.readyClear)) {
                return false;
            }
        }
        return true;
    }
});
