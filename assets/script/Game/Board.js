var Board = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function() {
        this._board = [];
        this.delCubeRowList = [];
        this.delCubeColList = [];
    },
    // 属性
    properties:{
        // 模板
        tempCube: {
            default: null,
            type: Fire.Entity
        },
        // 各种颜色
        gridColor:{
            default: new Fire.Color(1, 1, 1, 1),
            type: Fire.Color()
        },
        // 偏移值
        offset: new Fire.Vec2(-140, -100),
        // 数量
        count: new Fire.Vec2(10, 10),
        // 大小
        size: new Fire.Vec2(30, 30),
        // 间距
        spacing: 2,
        // 创建
        _createOrClean: false,
        // 创建
        createOrClean: {
            get: function () {
                var cellList = this.entity.getChildren();
                this._createOrClean = cellList.length > 0;
                return this._createOrClean;
            },
            set: function (value) {
                if (value != this._createOrClean) {
                    this._createOrClean = value;
                    if (this._createOrClean) {
                        this.create();
                    }
                    else {
                        this._clean();
                    }
                }
            }
        }
    },
    // 通过X Y 获取Cell（X 0-9）(Y 0-9)
    getCell: function(x, y) {
        if (0 <= x && x <= 9 && 0 <= y && y <= 9) {
            return this._board[x][y];
        }
        return null;
    },
    // 判断是否可以在格子上放置方块
    canPutCubeToCell: function(cubeGroup, center) {
        for (var j = 0, len = cubeGroup._children.length; j < len; ++j) {
            var cube = cubeGroup._children[j].getComponent('Cube');
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
    },
    //
    start: function() {
        //-- 判断行是否可以消除
        this.entity.on("putCube", function (event) {
            var cell = event.target.getComponent('Cell');
            if(cell) {
                this._delLine(cell);
            }
        }.bind(this));
    },
    // 创建棋盘格子
    create: function() {
        this._board = [];
        var widthX = (this.size.x + this.spacing);
        var widthY = (this.size.y + this.spacing);
        for (var x = 0, len = this.count.x; x < len; ++x) {
            this._board[x] = [];
            for (var y = 0, len = this.count.y; y < len; ++y) {
                var entity = Fire.instantiate(this.tempCube);
                entity.parent = this.entity;
                entity.name = x + ":" + y;
                entity.transform.position = new Fire.Vec2(this.offset.x + x * widthX, this.offset.y + y * widthY);
                var renderer = entity.getComponent(Fire.SpriteRenderer);
                renderer.customSize = this.size;
                renderer.color = this.gridColor;
                var cell = entity.addComponent('Cell');
                cell.offset = new Fire.Vec2(x, y);
                this._board[x][y] = cell;
            }
        }
    },
    // 清空棋盘
    _clean: function() {
        var cellList = this.entity.getChildren()
        for(var i = 0,len = cellList.length; i < len; ++i) {
            cellList[i].destroy();
        }
        if (!Fire.Engine.isPlaying) {
            Fire.FObject._deferredDestroy();
        }
        this._board = [];
    },
    // 删除
    _delLine: function(cell) {
        var clearRow = true, clearCol = true;
        var tempCell = null;
        var x = 0, y = 0;
        var tempDelCubeRowList = []
        var tempDelCubeColList = []
        // 左右遍历
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
        // 上下遍历
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
    }
});
