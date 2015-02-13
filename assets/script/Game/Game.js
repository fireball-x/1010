var Board = require('Board');
var Cell = require('Cell');
var Cube = require('Cube');
var CubeGroup = require('CubeGroup');
var AudioControl = require('AudioControl');
var Background = require('Background');

var Game = Fire.defineComponent(function() {
    this.board = null;
    this.cubeGroup = null;
    this.cubeGroupList = [];
    this.fraction = 0;//--当前分数
	
    this._btnBackDown = false;
    this._btnBack = null;
    this.restart = null;
    this._scoreValue = null;
    
    // 分数上涨动画
    this.isJump = false;
    this.jumpFirst = true;
    
    Game.instance = this;
});

Game.instance = null;

Game.prototype.onLoad = function() {
    
    //随机切换背景图片
    Background.loadBackground();
    
    //-- 创建格子到棋盘上
    if (!this.tempCube) {
        this.tempCube = Fire.Entity.find('/Prefabs/Cube');
    }
	    
    var boardObj = Fire.Entity.find('/Board');
    this.board = boardObj.getComponent(Board);
    this.board.create();
    
    var cubeGroupObj = Fire.Entity.find('/CubeGroup');
    this.cubeGroup = cubeGroupObj.getComponent(CubeGroup);
    if (Fire.Engine.isPlaying) {
        if (this.cubeGroupList.length === 0) {
            this.cubeGroupList = this.cubeGroup.create3(32);
        }
    }

    this._btnBack = Fire.Entity.find("/btn_back");
	this.restart = Fire.Entity.find('/restart');
    this._btnBack.on("mousedown", function () {
        this._btnBackDown = true;
    }.bind(this));

    this._btnBack.on("mouseup", function () {
        if (this._btnBackDown) {
            Fire.Engine.loadScene("42308794-9962-4cc5-ba9b-c42028d19ae2");
            this._btnBackDown = false;
        }
    }.bind(this));

    this.restart.on("mouseup",function () {
        Fire.Engine.loadScene("de895751-2fef-47bf-8cd8-024ad8e3778d");
    });
    
    this._scoreValue = Fire.Entity.find("/Score/Value");
};

Game.prototype.update = function() {
	if (this.isJump) {
        this.jumpAnimation();
    }
};

//-- �方块组放到棋盘上
Game.prototype.putBoard = function(cubeGroup) {
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
        cubeGroup.destroy();

        this.addFraction(curbCount);

        this.removeLine();

        if (this.cubeGroupList.length === 0) {
            this.cubeGroupList = this.cubeGroup.create3(32);
        }
    }
    return hasPutCube;
};

Game.prototype.removeLine = function() {
    if (this.board.delCubeRowList.length > 0 || this.board.delCubeColList.length > 0) {
        AudioControl.play_finished();
    }
    
    var i = 0,
    j = 0,
    delCubeList = null;
    for (i = 0; i < this.board.delCubeRowList.length; i++) {
        delCubeList = this.board.delCubeRowList[i];
        for (j = 0; j < delCubeList.length; j++) {
            delCubeList[j].playAnimation();
        }
    }
    for (i = 0; i < this.board.delCubeColList.length; i++) {
        delCubeList = this.board.delCubeColList[i];
        for (j = 0; j < delCubeList.length; j++) {
            delCubeList[j].playAnimation();
        }
    }

    this.board.delCubeRowList = [];
    this.board.delCubeColList = [];
    this._scoreValue.transform.scale = new Fire.Vec2(0.5,0.5);
    this.isJump = true;
};

//-- 添加分数
Game.prototype.addFraction = function (curbCount) {
    var curFraction = this.fraction;
    
    var lineNum = this.board.delCubeRowList.length;
    var rowNum = lineNum * this.board.count.x;
    if (lineNum > 1) {
        rowNum = (1 + (lineNum - 1) * 0.5) * (this.board.count.x * lineNum);
    }
    
    lineNum =  this.board.delCubeColList.length;
    var colNum = lineNum * this.board.count.x;
    if (lineNum > 1) {
        colNum = (1 + (lineNum - 1) * 0.5) * (this.board.count.y * lineNum);
    }
    
    this.fraction = (curFraction + curbCount) + rowNum + colNum;


    console.log(curFraction);
    console.log(curbCount);
    console.log(rowNum);
    console.log(colNum);
    console.log(this.fraction);

    this._scoreValue.getComponent(Fire.BitmapText).text = this.fraction;
};


Game.prototype.jumpAnimation = function () {
    if (this.jumpFirst) {
    	this._scoreValue.transform.scale = new Fire.Vec2(this._scoreValue.transform.scale.x + Fire.Time.deltaTime * 10,this._scoreValue.transform.scale.y + Fire.Time.deltaTime * 10);    
    	if (this._scoreValue.transform.scale.x >= 1.5) {
            this.jumpFirst = false;
        }
    }else {
        this._scoreValue.transform.scale = new Fire.Vec2(this._scoreValue.transform.scale.x - Fire.Time.deltaTime * 10,this._scoreValue.transform.scale.y - Fire.Time.deltaTime * 10);    
    	if (this._scoreValue.transform.scale.x <= 1) {
            this._scoreValue.transform.scale = new Fire.Vec2(1,1);
            this.isJump = false;
            this.jumpFirst = true;
        }
    }
};

Game.prototype.GameOver = function () {
    var gameOverBoard = Fire.Entity.find('/GameOver');
    gameOverBoard.transform.scale = new Fire.Vec2(1,1);
};

module.exports = Game;

