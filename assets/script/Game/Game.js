var Board = require('Board');
var Cell = require('Cell');
var Cube = require('Cube');
var CubeGroup = require('CubeGroup');

var Game = Fire.defineComponent(function () {
    this.board = null;
    this.tempCube = null;
});


Game.prototype.onLoad = function () {
	//-- 创建格子到棋盘上
    if (!this.tempCube) {
        this.tempCube = this.entity.find('../Prefabs/Cube');
    }
    var boardObj = this.entity.find('../Board');
    this.board = boardObj.getComponent(Board);
    this.board.create();
    
    boardObj.on('mousedown', function (event) {
        var cube = null;
        var cell = event.target.getComponent(Cell);
        if (!cell) {
            cube = event.target.getComponent(Cube);
            if (cube) {
                cube.Clear();
            }
        }
        else {
            var groupObj = this.entity.find('../CubeGroup');
            var group = groupObj.getComponent(CubeGroup);
            var cubGroup = group.create(32, CubeGroup.prototype.gridType.Line_5_90);
            var center = cell;
            var child = [];
            for (var i = 0; i < cubGroup._children.length; ++i) {
                child.push(cubGroup._children[i]);
            }
            var hasPutCube = this.board.canPutCubeToCell(cubGroup, center);
            if (hasPutCube) {
                for (var j = 0, len = cubGroup._children.length; j < len; j++) {
                    cube = child[j].getComponent(Cube);
                    var pos = cube.position;
                    cell = this.board.getCell(center.pos.x + pos.x, center.pos.y + pos.y);
                    cell.putCube(cube);
                }

            }
        }
    }.bind(this));
};

Game.prototype.delline = function(cubeX , cubeY){

    var clearRow = true, clearCol = true;
    var cell = null;
    var x = 0, y = 0, len = cubeX;
    var delCubeList = [];
    for (x = 0; x < len; ++x) {
        cell = this.board.getCell(x, cubeY);
        if (!cell.hasCube) {
            clearRow = false;
            break;
        }
        else {
            delCubeList.push(cell.child)
        }
    }
    if (clearRow) {
        len = Math.abs(cubeX - this.board.count.x);
        for (x = 0; x < len; ++x) {
            cell = this.board.getCell(x, cubeY);
            if (!cell.hasCube) {
                clearRow = false;
                break;
            }
        }
    }
    for (y = 0, len = cubeY; y < len; ++y) {
        cell = this.board.getCell(cubeX, y);
        if (!cell.hasCube) {
            clearCol = false;
            break;
        }
    }
    if (clearCol) {
        len = Math.abs(cubeY - this.board.count.y);
        for (y = 0; y < len; ++y) {
            cell = this.board.getCell(cubeX, y);
            if (!cell.hasCube) {
                clearCol = false;
                break;
            }
        }
    }
};

Game.prototype.onStart = function () {

};

Game.prototype.update = function () {

};

module.exports = Game;
