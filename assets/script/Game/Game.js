var Board = require('Board');
var CubeGroupManager = require('CubeGroupManager');
var Cube = require('Cube');

// 游戏状态
var GameState = Fire.defineEnum({
    ready : -1,
    normal: -1,
    dispel: -1
});

var Game = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function() {
        this.gameState = GameState.reday;
        this.cubeGroup = null;
        this.cubeGroupList = [];
        this.fraction = 0;//--当前分数
        this.idleCellList = [];//-- 场上空闲的格
        // 分数上涨动画
        this.playScoreAnimation = false;
        this.scoreAnimCount = 0;
        Game.instance = this;
    },
    // 属性
    properties: {
        tempCube: {
            default: null,
            type: Fire.Entity
        },
        board: {
            default: null,
            type: Board
        },
        cubeGroupManager:{
            default: null,
            type: CubeGroupManager
        },
        scoreText: {
            default: null,
            type   : Fire.BitmapText
        },
        gameOverMenu: {
            default: null,
            type: Fire.Entity
        },
        audio_done: {
            default: null,
            type: Fire.AudioSource
        }
    },
    //
    onStart: function(){
        // 创建棋盘
        this.board.create();
        // 游戏状态
        this.gameState = GameState.reday;
    },
    update: function() {
        if (this.playScoreAnimation) {
            this._scoreAnimation();
        }
        //
        switch (this.gameState) {
            case GameState.reday:
                //-- 更新棋盘上的空格
                this._updateIdleCellList();
                //-- 创建新的Cube Group
                if (this.cubeGroupList.length === 0) {
                    this.cubeGroupList = this.cubeGroupManager.create3(32);
                }
                //-- 判断pass或者失败
                var pass = this.pass();
                if (!pass) {
                    this._gameOver();
                }
                break;
            case GameState.normal:
                break;
            case GameState.dispel:
                //-- 清除满格
                this._removeLine();
                this.gameState = GameState.reday;
                break;
            default:
                break;
        }
    },
    // 方块组放到棋盘
    putBoard: function(cubeGroup) {
        if (!cubeGroup && !cubeGroup._children) {
            return false;
        }
        var w2l = this.board.transform.getWorldToLocalMatrix();
        var pos = w2l.transformPoint(cubeGroup.transform.worldPosition);

        var x = Math.round((pos.x - this.board.offset.x) / (this.board.size.x + this.board.spacing / 2));
        var y = Math.round((pos.y - this.board.offset.y) / (this.board.size.y + this.board.spacing / 2));
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
                var cube = child[i].getComponent('Cube');
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
            this._addFraction(curbCount);
            this.gameState = GameState.dispel;
        }
        else {
            this.gameState = GameState.normal;
        }
        return hasPutCube;
    },
    //
    _removeLine: function() {
        if (this.board.delCubeRowList.length > 0 || this.board.delCubeColList.length > 0) {
            this.audio_done.play();
        }

        var i = 0, j = 0, delCubeList = null;
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
        this.scoreText.transform.scale = new Fire.Vec2(0.5, 0.5);
        this.playScoreAnimation = true;
    },
    // 添加分数
    _addFraction: function(curbCount) {
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
        this.scoreText.text = this.fraction;
    },
    //
    _updateIdleCellList: function() {
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
    _scoreAnimation: function(){
        if (this.scoreAnimCount == 0) {
            this.scoreText.transform.scaleX += Fire.Time.deltaTime * 10;
            this.scoreText.transform.scaleY += Fire.Time.deltaTime * 10;
            if (this.scoreText.transform.scaleX >= 1.5) {
                this.scoreAnimCount = 1;
            }
        } else {
            this.scoreText.transform.scaleX -= Fire.Time.deltaTime * 10;
            this.scoreText.transform.scaleY -= Fire.Time.deltaTime * 10;
            if (this.scoreText.transform.scaleX <= 1) {
                this.scoreText.transform.scale = new Fire.Vec2(1, 1);
                this.playScoreAnimation = false;
                this.scoreAnimCount = 0
            }
        }
    },
    //
    pass: function() {
        var cubeGroup = null;
        var idleCell = null;
        for (var i = 0; i < this.cubeGroupList.length; i++) {
            var cubeGroup = this.cubeGroupList[i];
            for (var j = 0; j < this.idleCellList.length; j++) {
                var idleCell = this.idleCellList[j];
                var center = new Fire.Vec2(idleCell.offset.x, idleCell.offset.y);
                var canPut = this.board.canPutCubeToCell(cubeGroup, center);
                if (canPut) {
                    return true;
                }
            }
        }
        return false;
    },
    // 游戏结束事件
    _gameOver: function() {
        this.gameOverMenu.active = true;
    }
});

Game.instance = null;
