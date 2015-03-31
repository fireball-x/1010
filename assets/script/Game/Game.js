var Board = require('Board');
var Cell = require('Cell');
var Cube = require('Cube');
var CubeGroup = require('CubeGroup');
var AudioControl = require('AudioControl');


var StateType = Fire.defineEnum({
    ready : -1,
    normal: -1,
    dispel: -1
});

var Game = Fire.Class({
    // 继承
    extends: Fire.Component,

    // 构造函数
    constructor: function() {
        this.board = null;
        this.cubeGroup = null;
        this.cubeGroupList = [];
        this.fraction = 0;//--当前分数

        this.idleCellList = [];//-- 场上空闲的格

        this.scoreText = null;
        this._scoreValue = null;

        // 分数上涨动画
        this.isJump = false;
        this.jumpFirst = true;

        Game.instance = this;
    },

    // 属性
    properties: {

    },

    //
    onLoad: function(){
        //-- 创建格子到棋盘上
        if (!this.tempCube) {
            this.tempCube = Fire.Entity.find('/Prefabs/cube');
        }

        this.scoreText = Fire.Entity.find('/GameOver/score');
        var boardObj = Fire.Entity.find('/Board');
        this.board = boardObj.getComponent(Board);
        this.board.create();

        var cubeGroupObj = Fire.Entity.find('/CubeGroup');
        this.cubeGroup = cubeGroupObj.getComponent(CubeGroup);

        var soceObj = Fire.Entity.find("/Score/value");
        this._scoreValue = soceObj.getComponent(Fire.BitmapText);

        this.gameState = StateType.reday;
    },
    update: function() {
        if (this.isJump) {
            this.jumpAnimation();
        }

        switch (this.gameState) {
            case StateType.reday:
                //-- 更新棋盘上的空格
                this.updateIdleCellList();

                //-- 创建新的Cube Group
                if (this.cubeGroupList.length === 0) {
                    this.cubeGroupList = this.cubeGroup.create3(32);
                }

                //-- 判断pass或者失败
                var pass = this.pass();
                if (!pass) {
                    this.gameOver();
                }
                break;
            case StateType.normal:
                break;
            case StateType.dispel:
                //-- 清除满格
                this.removeLine();

                this.gameState = StateType.reday;
                break;
            default:
                break;
        }
    },
    // 方块组放到棋盘
    putBoard: function(cubeGroup) {
        if (!cubeGroup && !cubeGroup._children) {
            return;
        }
        var w2l = this.board.transform.getWorldToLocalMatrix();
        var pos = w2l.transformPoint(cubeGroup.transform.worldPosition);

        var x = Math.round(pos.x / (this.board.size.x + this.board.spacing / 2));
        var y = Math.round(pos.y / (this.board.size.y + this.board.spacing / 2));
        var center = new Vec2(x, y);
        var hasPutCube = this.board.canPutCubeToCell(cubeGroup, center);

        var curbCount = cubeGroup._children.length;
        if (hasPutCube) {
            var i = 0,
                len = 0,
                child = [];
            for (i = 0, len = cubeGroup._children.length; i < len; ++i) {
                child.push(cubeGroup._children[i]);
            }
            for (i = 0, len = child.length; i < len; ++i) {
                var cube = child[i].getComponent(Cube);
                if (!cube) {
                    continue;
                }
                var pos = cube.position;
                var cell = this.board.getCell(center.x + pos.x, center.y + pos.y);
                cell.putCube(cube);
            }

            for (i = 0, len = this.cubeGroupList.length; i < len; ++i) {
                var group = this.cubeGroupList[i];
                if (group.id === cubeGroup.id) {
                    this.cubeGroupList.splice(i, 1);
                    break;
                }
            }
            //-- 添加分数
            this.addFraction(curbCount);
            cubeGroup.destroy();

            this.gameState = StateType.dispel;
        }
        else {
            this.gameState = StateType.normal;
        }
        return hasPutCube;
    },
    //
    removeLine: function() {
        if (this.board.delCubeRowList.length > 0 || this.board.delCubeColList.length > 0) {
            AudioControl.play_finished();
        }

        var i = 0,
            j = 0,
            delCubeList = null;
        for (i = 0; i < this.board.delCubeRowList.length; i++) {
            delCubeList = this.board.delCubeRowList[i];
            for (j = 0; j < delCubeList.length; j++) {
                delCubeList[j].removeCube();
            }
        }
        for (i = 0; i < this.board.delCubeColList.length; i++) {
            delCubeList = this.board.delCubeColList[i];
            for (j = 0; j < delCubeList.length; j++) {
                delCubeList[j].removeCube();
            }
        }

        this.board.delCubeRowList = [];
        this.board.delCubeColList = [];
        this._scoreValue.transform.scale = new Fire.Vec2(0.5, 0.5);
        this.isJump = true;
    },
    // 添加分数
    addFraction: function(curbCount) {
        var curFraction = this.fraction;

        var lineNum = this.board.delCubeRowList.length;
        var rowNum = lineNum * this.board.count.x;
        if (lineNum > 1) {
            rowNum = (1 + (lineNum - 1) * 0.5) * (this.board.count.x * lineNum);
        }

        lineNum = this.board.delCubeColList.length;
        var colNum = lineNum * this.board.count.x;
        if (lineNum > 1) {
            colNum = (1 + (lineNum - 1) * 0.5) * (this.board.count.y * lineNum);
        }

        this.fraction = (curFraction + curbCount) + rowNum + colNum;

        this._scoreValue.text = this.fraction;
    },
    //
    updateIdleCellList: function() {
        this.idleCellList = [];
        for (var x = 0; x < this.board.count.x; ++x) {
            for (var y = 0; y < this.board.count.x; ++y) {
                var cell = this.board.getCell(x, y);
                if (!cell.hasCube || (cell.cube && cell.readyClear)) {
                    this.idleCellList.push(cell);
                }
            }
        }
    },
    // 分数跳跃动画
    jumpAnimation: function(){
        if (this.jumpFirst) {
            this._scoreValue.transform.scaleX += Fire.Time.deltaTime * 10;
            this._scoreValue.transform.scaleY += Fire.Time.deltaTime * 10;
            if (this._scoreValue.transform.scaleX >= 1.5) {
                this.jumpFirst = false;
            }
        }else {
            this._scoreValue.transform.scaleX -= Fire.Time.deltaTime * 10;
            this._scoreValue.transform.scaleY -= Fire.Time.deltaTime * 10;
            if (this._scoreValue.transform.scaleX <= 1) {
                this._scoreValue.transform.scale = new Fire.Vec2(1,1);
                this.isJump = false;
                this.jumpFirst = true;
            }
        }
    },
    //
    pass: function() {
        var groupList = this.cubeGroupList;
        var idleCellList = this.idleCellList;
        var grouplen = groupList.length;
        var celllen = idleCellList.length;
        var canPut = false;
        for (var i = 0; i < grouplen; i++) {
            for (var j = 0; j < celllen; j++) {
                var center = new Fire.Vec2(idleCellList[j].offset.x, idleCellList[j].offset.y);
                var canPut = this.board.canPutCubeToCell(groupList[i], center);
                if (canPut) {
                    break
                }
            }
            if (canPut) {
                break
            }
        }
        return canPut;
    },
    // 游戏结束事件
    gameOver: function(){
        var scoreBitmapText = this.scoreText.getComponent(Fire.BitmapText)
        scoreBitmapText.text = this.fraction;
        var gameOverBoard = Fire.Entity.find('/GameOver');
        gameOverBoard.transform.scale = new Fire.Vec2(1,1);
        this.isScore = true;
    }
});

Game.instance = null;
