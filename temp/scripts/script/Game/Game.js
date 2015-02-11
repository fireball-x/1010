Fire._RFpush('06309e377960460cb8bc68e4e31dee66', 'Game');
// script/Game/Game.js

var Board = require('Board');
var Cell = require('Cell');
var Cube = require('Cube');
var CubeGroup = require('CubeGroup');

var Game = Fire.defineComponent(function () {
    this.board = null;
    this.cubeGroup = null;
    this.cubeGroupList = [];
    
    Game.instance = this;
});

Game.instance = null;

Game.prototype.onLoad = function () {
	//-- 创建格子到棋盘上
    if (!this.tempCube) {
        this.tempCube = Fire.Entity.find('/Prefabs/Cube');
    }
    var boardObj = Fire.Entity.find('/Board');
    this.board = boardObj.getComponent(Board);
    this.board.create();
    
    var cubeGroupObj = Fire.Entity.find('/CubeGroup');
    this.cubeGroup = cubeGroupObj.getComponent(CubeGroup);
    if(Fire.Engine.isPlaying){
        if(this.cubeGroupList.length === 0){
			this.cubeGroupList = this.cubeGroup.create3(32);
    	}
    }
    
//     boardObj.on('mousedown', function (event) {
//         console.log(event);
//         var cube = null;
//         var cell = event.target.getComponent(Cell);
//         if (!cell) {
//             cube = event.target.getComponent(Cube);
//             if (cube) {
//                 cube.Clear();
//             }
//         }
//         else {
//             var groupObj = this.entity.find('../CubeGroup');
//             var group = groupObj.getComponent(CubeGroup);
//             var cubGroup = group.create(32, CubeGroup.prototype.gridType.Line_5_90);
//             var center = cell;
//             var child = [];
//             for (var i = 0; i < cubGroup._children.length; ++i) {
//                 child.push(cubGroup._children[i]);
//             }
//             var hasPutCube = this.board.canPutCubeToCell(cubGroup, center);
//             if (hasPutCube) {
//                 for (var j = 0, len = cubGroup._children.length; j < len; j++) {
//                     cube = child[j].getComponent(Cube);
//                     var pos = cube.position;
//                     cell = this.board.getCell(center.pos.x + pos.x, center.pos.y + pos.y);
//                     cell.putCube(cube);
//                 }

//             }
//         }
    //}.bind(this));
};

Game.prototype.update = function () {

};

//-- 把 方块组放到棋盘上
Game.prototype.putBoard = function (cubeGroup) {
    if (!cubeGroup && !cubeGroup._children) {
        return;
    }
    var w2l = this.board.transform.getWorldToLocalMatrix();
    var pos = w2l.transformPoint(cubeGroup.transform.worldPosition);

    var x = Math.round(pos.x / (this.board.size.x + this.board.spacing / 2));
    var y = Math.round(pos.y / (this.board.size.y + this.board.spacing / 2));
    console.log(x + "  " + y);
    var center = new Vec2(x, y);
    var hasPutCube = this.board.canPutCubeToCell(cubeGroup, center);

    if (hasPutCube) {
        var i = 0, len = 0, child = [];
        for (i = 0, len = cubeGroup._children.length; i < len; ++i) {
            child.push(cubeGroup._children[i]);
        }
        for (i = 0, len = child.length; i < len; ++i) {
            var cube = child[i].getComponent(Cube);
            var pos = cube.position;
            var cell = this.board.getCell(center.x + pos.x, center.y + pos.y);
            cell.putCube(cube);
        }

        for (i = 0, len = this.cubeGroupList.length; i < len; ++i) {
            var group = this.cubeGroupList[i];
            if (group.id === cubeGroup.id ) {
                this.cubeGroupList.splice(i, 1);
                break;
            }
        }
        cubeGroup.destroy();

        if (this.cubeGroupList.length === 0) {
            this.cubeGroupList = this.cubeGroup.create3(32);
        }
    }
    return hasPutCube;
};

Game.prototype.delline = function(cube){
	
    var clearRow = true, clearCol = true;
    var cell = null;
    var x = 0, y = 0, len = cube.position.y;
    var delCubeList = [];
    for (x = 0; x < len; ++x) {
        cell = this.board.getCell(x, cube.position.y);
        if (!cell.hasCube) {
            clearRow = false;
            break;
        }
        else {
            delCubeList.push(cell.child)
        }
    }
    if (clearRow) {
        len = Math.abs(cube.position.x - this.board.count.x);
        for (x = 0; x < len; ++x) {
            cell = this.board.getCell(x, cube.position.y);
            if (!cell.hasCube) {
                clearRow = false;
                break;
            }
        }
    }
    for (y = 0, len = cube.position.y; y < len; ++y) {
        cell = this.board.getCell(cube.position.x, y);
        if (!cell.hasCube) {
            clearCol = false;
            break;
        }
    }
    if (clearCol) {
        len = Math.abs(cube.position.y - this.board.count.y);
        for (y = 0; y < len; ++y) {
            cell = this.board.getCell(cube.position.x, y);
            if (!cell.hasCube) {
                clearCol = false;
                break;
            }
        }
    }
    
    if(clearRow){
        
    }
    
    if(clearCol){
        
    }
    
};

module.exports = Game;


Fire._RFpop();