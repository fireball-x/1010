require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"AudioControl":[function(require,module,exports){
Fire._RFpush('38f164e9c2b844baa46f0d4d7d7205dd', 'AudioControl');
// script/Game/AudioControl.js

var AudioControl = {};

AudioControl.play_finished = function () {
    var Audio_finished = Fire.Entity.find('/Audio/done');
    var audio = Audio_finished.getComponent(Fire.AudioSource);
    audio.play();
};

AudioControl.play_bobo = function () {
    var Audio_bobo = Fire.Entity.find('/Audio/bobo');
    var audio = Audio_bobo.getComponent(Fire.AudioSource);
    audio.play();
};

module.exports = AudioControl;

Fire._RFpop();
},{}],"Board":[function(require,module,exports){
Fire._RFpush('fbbb16a7f4a84ff59ef689649c3168ec', 'Board');
// script/Game/Board.js

var Cell = require('Cell');
var Cube = require('Cube');

var Board = Fire.defineComponent(function () {
    this._tempGrid = null;

    this.delCubeRowList = [];
    this.delCubeColList = [];
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
};

Board.prototype.onLoad = function () {
    //-- 判断行是否可以消除
    this.entity.on("putCube", function (event) {
        var cell = event.target.getComponent(Cell);
        this.delline(cell);
    }.bind(this));
};

Board.prototype.delline = function (cell) {
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
    
};


//-- 清空棋盘
Board.prototype.clean = function () {
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
    for (var j = 0, len = cubeGroup._children.length; j < len; ++j) {
        var cube = cubeGroup._children[j].getComponent(Cube);
        var pos = cube.position;
        var cell = this.getCell(center.x + pos.x, center.y + pos.y);
        if (!cell || (cell.hasCube && !cell.readyClear)) {
            return false;
        }
    }
    return true;
};

module.exports = Board;

Fire._RFpop();
},{"Cell":"Cell","Cube":"Cube"}],"Button":[function(require,module,exports){
Fire._RFpush('cc304a3ca44e43488b9c400d9fab8945', 'Button');
// script/UI/Button.js

var Button = Fire.defineComponent(function () { 
	this._btnRender = null;
});

Button.prop('normal', null, Fire.ObjectType(Fire.Sprite));

Button.prop('hover', null, Fire.ObjectType(Fire.Sprite));

Button.prop('pressed', null, Fire.ObjectType(Fire.Sprite));

Button.prop('disabled', null, Fire.ObjectType(Fire.Sprite));

Button.prototype.onLoad = function () {

    this._btnRender = this.entity.getComponent(Fire.SpriteRenderer);
    
    this._btnRender.sprite = this.normal;
    
    this.entity.on('mousedown', function () {
        this._btnRender.sprite = this.pressed;
    }.bind(this));

    this.entity.on('mouseup', function () {
        this._btnRender.sprite = this.normal;
    }.bind(this));

};

Fire._RFpop();
},{}],"Cell":[function(require,module,exports){
Fire._RFpush('d2a358201e6d4a36b7fd92369c3dd36d', 'Cell');
// script/Game/Cell.js

var Cell = Fire.defineComponent();

Cell.prop('offset', new Fire.Vec2(0, 0));
Cell.prop('hasCube', false);
Cell.prop('cube', null, Fire.HideInInspector);
Cell.prop('readyClear', false, Fire.HideInInspector);

Cell.prototype.clean = function() {
    this.entity.destroy();
};

Cell.prototype.putCube = function (cube) {
    cube.entity.parent = this.entity;
    cube.transform.position = new Fire.Vec2(0, 0);
    this.hasCube = true;
    this.cube = cube;
    
    //-- 绑定已经放置方块消息
    this.entity.dispatchEvent(new Fire.Event("putCube", true));
    //-- 绑定Cube销毁消息
    this.entity.on("curb clear", function () {
        this.hasCube = false;
        this.readyClear = false;
        this.cube = null;
    }.bind(this));
};

module.exports = Cell;

Fire._RFpop();
},{}],"CubeGroup":[function(require,module,exports){
Fire._RFpush('931bfcf8d031410f9e7daeca279cedae', 'CubeGroup');
// script/Game/CubeGroup.js

var CubeGroup = Fire.defineComponent(function () {
    this.stopAnimation = true;
});

var Cube = require('Cube');

var thisTransform = null;

var AudioControl = require('AudioControl');

var thisGroup = null;

var camera = null;

CubeGroup.prop("_creatCubes", false, Fire.HideInInspector);

CubeGroup.prop('_creatThree', false, Fire.HideInInspector);

CubeGroup.getset('CreatThree',

function() {
    return this._creatThree;
},
function(value) {
    if (value != this._creatThree) {
        this._creatThree = value;
    }
    if (value) {
        this.create3(32);
    }
});

CubeGroup.getset("CreatCubes",

function() {
    return this._creatCubes;
},

function(value) {
    if (value !== this._creatCubes) {
        this._creatCubes = value;
        if (value) {
            var obj = this.createRandom(32);
        } else {
            this.clear();
        }
    }
});

var Box_9 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": 0,
    "x": 1
},
{
    "y": -1,
    "x": 0
},
{
    "y": -1,
    "x": 1
},
{
    "y": -1,
    "x": -1
},
{
    "y": 1,
    "x": -1
},
{
    "y": 1,
    "x": 0
},
{
    "y": 1,
    "x": 1
},
]; // 田 *3

var Curved_3_0 = [{
    "y": 1,
    "x": 0
},
{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
]; //L *3  0
var Curved_3_90 = [{
    "y": 0,
    "x": 0
},
{
    "y": -1,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
]; //L *3 90
var Curved_3_180 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": -1,
    "x": 0
},
]; //L *3 180
var Curved_3_270 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": 1,
    "x": 0
},
]; //L *3 270

var Curved_5_0 = [{
    "y": 0,
    "x": 0
},
{
    "y": 1,
    "x": 0
},
{
    "y": 2,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
{
    "y": 0,
    "x": 2
},
]; //L *5 0
var Curved_5_90 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
{
    "y": 0,
    "x": 2
},
{
    "y": -1,
    "x": 0
},
{
    "y": -2,
    "x": 0
},
]; //L *5 0 90
var Curved_5_180 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": 0,
    "x": -2
},
{
    "y": -1,
    "x": 0
},
{
    "y": -2,
    "x": 0
},
]; //L *5 0 180
var Curved_5_270 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": 0,
    "x": -2
},
{
    "y": 2,
    "x": 0
},
{
    "y": 1,
    "x": 0
},
]; //L *5 0 270
var Box_4 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
{
    "y": 1,
    "x": 0
},
{
    "y": 1,
    "x": 1
},
];

var Box_1 = [{
    "y": 0,
    "x": 0
},
];

var Line_2_0 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
]; // -- *2 0
var Line_2_90 = [{
    "y": 0,
    "x": 0
},
{
    "y": 1,
    "x": 0
},
]; // I *2 90
var Line_3_0 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": 0,
    "x": 1
},
]; // --- *3 0
var Line_3_90 = [{
    "y": 0,
    "x": 0
},
{
    "y": 1,
    "x": 0
},
{
    "y": -1,
    "x": 0
},
]; // --- *3 90
var Line_4_0 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": 0,
    "x": 1
},
{
    "y": 0,
    "x": 2
},
]; // ---- *4 0
var Line_4_90 = [{
    "y": 0,
    "x": 0
},
{
    "y": -1,
    "x": 0
},
{
    "y": 1,
    "x": 0
},
{
    "y": 2,
    "x": 0
},
]; //---- *4 90
var Line_5_0 = [{
    "y": 0,
    "x": 0
},
{
    "y": 0,
    "x": -1
},
{
    "y": 0,
    "x": 1
},
{
    "y": 0,
    "x": 2
},
{
    "y": 0,
    "x": -2
},
];

var Line_5_90 = [{
    "y": 0,
    "x": 0
},
{
    "y": -1,
    "x": 0
},
{
    "y": -2,
    "x": 0
},
{
    "y": 1,
    "x": 0
},
{
    "y": 2,
    "x": 0
},
];

CubeGroup.prototype._gridType = [Box_9, Box_4, Box_1, Curved_3_0, Curved_3_90, Curved_3_180, Curved_3_270, Curved_5_0, Curved_5_90, Curved_5_180, Curved_5_270, Line_2_0, Line_2_90, Line_3_0, Line_3_90, Line_4_0, Line_4_90, Line_5_0, Line_5_90];

var GridType = (function(t) {
    t[t.Box_9 = 0] = 'Box_9';
    t[t.Box_4 = 1] = 'Box_4';
    t[t.Box_1 = 2] = 'Box_1';
    t[t.Curved_3_0 = 3] = 'Curved_3_0';
    t[t.Curved_3_90 = 4] = 'Curved_3_90';
    t[t.Curved_3_180 = 5] = 'Curved_3_180';
    t[t.Curved_3_270 = 6] = 'Curved_3_270';
    t[t.Curved_5_0 = 7] = 'Curved_5_0';
    t[t.Curved_5_90 = 8] = 'Curved_5_90';
    t[t.Curved_5_180 = 9] = 'Curved_5_180';
    t[t.Curved_5_270 = 10] = 'Curved_5_270';
    t[t.Line_2_0 = 11] = 'Line_2_0';
    t[t.Line_2_90 = 12] = 'Line_2_90';
    t[t.Line_3_0 = 13] = 'Line_3_0';
    t[t.Line_3_90 = 14] = 'Line_3_90';
    t[t.Line_4_0 = 15] = 'Line_4_0';
    t[t.Line_4_90 = 16] = 'Line_4_90';
    t[t.Line_5_0 = 17] = 'Line_5_0';
    t[t.Line_5_90 = 18] = 'Line_5_90';
    return t;
})({});

CubeGroup.prop("_select", GridType.Box_9, Fire.Enum(GridType), Fire.HideInInspector);

CubeGroup.getset('select',
function() {
    return this._select;
},
function(value) {
    //if (thisGroup.isValid) {
    //    this.clear();
    //}
    if (value != this._select) {
        this._select = value;
        //this.create(32, this._gridType[value]);
    }
},
Fire.Enum(GridType));

CubeGroup.prototype.gridType = {
    "Box_9": Box_9,
    "Box_4": Box_4,
    "Box_1": Box_1,
    "Curved_3_0": Curved_3_0,
    "Curved_3_90": Curved_3_90,
    "Curved_3_180": Curved_3_180,
    "Curved_3_270": Curved_3_270,
    "Curved_5_0": Curved_5_0,
    "Curved_5_90": Curved_5_90,
    "Curved_5_180": Curved_5_180,
    "Curved_5_270": Curved_5_270,
    "Line_2_0": Line_2_0,
    "Line_2_90": Line_2_90,
    "Line_3_0": Line_3_0,
    "Line_3_90": Line_3_90,
    "Line_4_0": Line_4_0,
    "Line_4_90": Line_4_90,
    "Line_5_0": Line_5_0,
    "Line_5_90": Line_5_90
};

///color
var blue = new Fire.Color(97 / 255, 190 / 255, 227 / 255, 1);
var yellow = new Fire.Color(253 / 255, 197 / 255, 76 / 255, 1);
var red = new Fire.Color(218 / 255, 192 / 255, 90 / 255, 1);
var lightblue = new Fire.Color(83 / 255, 211 / 255, 174 / 255, 1);
var pink = new Fire.Color(229 / 255, 107 / 255, 129 / 255, 1);
var orange = new Fire.Color(243/255,80/255,12/255,1);
var green = new Fire.Color(85/255,192/255,67/255,1);

CubeGroup.prototype._Colors = [blue, yellow, red, lightblue, pink,orange,green];

CubeGroup.prototype.Colors = {
    "blue": blue,
    "yellow": yellow,
    "red": red,
    "lightblue": lightblue,
    "pink": pink,
    "orange": orange,
    "green": green,
};


var startX = 0;
var startY = 0;
var isMouseUp = true;


var moveGrid = null;

/// ***********************
/// * size: 单个cube大小
/// * gridType: 指定的cubeGroup
/// * callback:
/// * _color: [可选] 设置指定color. 如果不设置，则随机
/// ***********************
CubeGroup.prototype.create = function(size, gridType, _color) {
    var color = this._Colors[Math.floor(Math.random() * 7)];
    if ( !! _color) {
        color = _color;
    }

    var grid = this.entity.find('../Prefabs/cube');
    var gridGroup = new Fire.Entity('group');
    gridGroup.parent = this.entity;

    for (var i = 0; i < gridType.length; i++) {
        var obj = Fire.instantiate(grid);
        obj.parent = gridGroup;
        obj.name = 'child_' + i;
        var cube = obj.addComponent(Cube);

        cube.position = new Fire.Vec2(gridType[i].x, gridType[i].y);
        obj.getComponent(Fire.SpriteRenderer).color = color;
        obj.transform.position = new Vec2(gridType[i].x * size, gridType[i].y * size);
    }

    gridGroup.transform.scale = new Fire.Vec2(0.8,0.8);

    gridGroup.on('mousedown',
        function(event) {
        	isMouseUp = false;
            moveGrid = gridGroup;
        	moveGrid.transform.scale = new Fire.Vec2(0.9,0.9);
        }.bind(this)
	);

    gridGroup.on('mouseup',
       function (event) {
           moveGrid = null;
       }.bind(this)
   );

    thisGroup = gridGroup;
    return gridGroup;
};

CubeGroup.prototype.createRandom = function(size) {
    var ran = 0;
    ran = Math.floor(Math.random() * 19);
    var ranGrid = this._gridType[ran];
    return this.create(size, ranGrid);
};

CubeGroup.prototype.move = function (moveX,moveY,grid) {
    var CubeGroupPosition = thisTransform;
    var screenPosition = new Fire.Vec2(moveX,moveY);
    var wordPostion = camera.screenToWorld(screenPosition);
    grid.transform.position = new Fire.Vec2(wordPostion.x + CubeGroupPosition.x,wordPostion.y - CubeGroupPosition.y);
};

var groupBorad = [];
var groupBoradPositions = [];


CubeGroup.prototype.create3 = function(size) {
    groupBoradPositions = [];

    groupBorad = [];
    for (var i = 0; i < 3; i++) {
        var group = this.createRandom(size);
        group.transform.position = new Fire.Vec2((( - 5 * size) + (5 * size) * i), group.transform.position.y);
        var xy = {"id":group.id,'position':group.transform.position};
        groupBoradPositions.push(xy);
        groupBorad.push(group);
    }
    this.entity.transform.scale = new Fire.Vec2(0.0,0.0);
    this.play();

    return groupBorad;
};

CubeGroup.prototype.clear = function() {
    try {
        thisGroup.destroy();
    } catch(e) {

	}
};

CubeGroup.prototype.resetPosition = function(group) {
    var undoPosition = group.transform.position;
	for(var i =0; i < groupBorad.length; i++ ) {
		if (groupBorad[i].id === group.id) {
            for (var j = 0; j < groupBoradPositions.length; j++) {
                if (groupBoradPositions[j].id === group.id) {
                    group.transform.position = groupBoradPositions[j].position;
                    group.transform.scale = new Fire.Vec2(0.8,0.8);
                }
            }
        }
    }
};

CubeGroup.prototype.onLoad = function() {

    if (Fire.Engine.isPlaying) {

        var Game = require('Game');

        Fire.Input.on('mousedown', function (event) {
            startX = event.screenX;
            startY = event.screenY;
        }.bind(this));

        Fire.Input.on('mousemove', function (event) {
            if (!isMouseUp) {
                this.move(event.screenX, event.screenY, moveGrid);
            }
        }.bind(this));

        Fire.Input.on('mouseup', function (event) {
            isMouseUp = true;
            if (moveGrid) {
                var canPut = Game.instance.putBoard(moveGrid);
                if (!canPut) {
                    this.resetPosition(moveGrid);
                }
                AudioControl.play_bobo();
                moveGrid = null;
            }
        }.bind(this));

        camera = Fire.Entity.find("/Main Camera").getComponent(Fire.Camera);
        thisTransform = Fire.Entity.find("/CubeGroup").transform.position;
    }
};


CubeGroup.prototype.play = function () {
  	  this.stopAnimation = false;
};

CubeGroup.prototype.animation = function () {
  this.entity.transform.scale = new Fire.Vec2(this.entity.transform.scale.x + Fire.Time.deltaTime * 5, this.entity.transform.scale.x + Fire.Time.deltaTime * 5);
    if (this.entity.transform.scale.x + Fire.Time.deltaTime >= 1) {
        this.entity.transform.scale = new Fire.Vec2(1,1);
        this.stopAnimation = true;
    }
};

CubeGroup.prototype.update = function() {
	if (!this.stopAnimation) {
        this.animation();
    }
};

module.exports = CubeGroup;

Fire._RFpop();
},{"AudioControl":"AudioControl","Cube":"Cube","Game":"Game"}],"Cube":[function(require,module,exports){
Fire._RFpush('1b94adf1d4114c4480e3a5fe8e59c19b', 'Cube');
// script/Game/Cube.js

var cube = Fire.defineComponent(function() {
    this.stopAnimation = true;
});

cube.prop('_position', new Fire.Vec2(0, 0), Fire.HideInInspector);
cube.prop('_play', false, Fire.HideInInspector);

cube.getset('play',
function() {
    return this._play;
},
function(value) {
    if (value !== this._play) {
        this._play = value;
    }
    if (value) {
        this.playAnimation();
    }
});

cube.getset('position',
function() {
    return this._position;
},
function(value) {
    if (value != this._position) {
        this._position = value;
    }
});

cube.prototype.clear = function() {
    this.entity.dispatchEvent(new Fire.Event("curb clear", true));
    this.entity.destroy();
};

cube.prototype.playAnimation = function() {
    this.stopAnimation = false;
};

cube.prototype.animation = function() {
    this.entity.transform.scale = new Fire.Vec2(this.entity.transform.scale.x - Fire.Time.deltaTime * 5, this.entity.transform.scale.x - Fire.Time.deltaTime * 5);
    if (this.entity.transform.scale.x - Fire.Time.deltaTime <= 0) {
        this.stopAnimation = true;
        this.clear();
    }
};

cube.prototype.update = function() {
    if (!this.stopAnimation) {
        this.animation();
    }
};

module.exports = cube;

Fire._RFpop();
},{}],"GameMenu":[function(require,module,exports){
Fire._RFpush('6634f146f45a4791a3ab864e29497a89', 'GameMenu');
// script/Game/GameMenu.js

var GameMenu = Fire.defineComponent(function() {
});

GameMenu.prototype.onLoad = function () {

    this.homeUUID = "e41bbde0-cee8-475f-b96c-169db4f6d69d";
    this.gameUUID = "e958312b-03e3-4a03-a2fe-6e7f40f634d6";
    this.menu = Fire.Entity.find('/Menu');

    var btn_Menu = Fire.Entity.find("/Button/btn_Menu");
    btn_Menu.on("mouseup", function () {
        this.menu.active = true;
    }.bind(this));

    var btn_Continue = Fire.Entity.find('/Menu/btn_Continue');
    btn_Continue.on("mouseup", function () {
        this.menu.active = false
    }.bind(this));

    var btn_Restart = Fire.Entity.find('/Menu/btn_Restart');
    btn_Restart.on("mouseup", function () {
        Fire.Engine.loadScene(this.gameUUID);
    }.bind(this));

    var btn_Home = Fire.Entity.find('/Menu/btn_Home');
    btn_Home.on("mouseup", function () {
        Fire.Engine.loadScene(this.homeUUID);
    }.bind(this));

    var gameOverRestart = Fire.Entity.find("/GameOver/btn_Restart");
    gameOverRestart.on('mouseup',function () {
       Fire.Engine.loadScene(this.gameUUID);
    }.bind(this));
    
    var gameOverHome = Fire.Entity.find("/GameOver/btn_Home");
    gameOverHome.on('mouseup',function () {
       Fire.Engine.loadScene(this.homeUUID);
    }.bind(this));
};

Fire._RFpop();
},{}],"Game":[function(require,module,exports){
Fire._RFpush('ff42982fad42403380ce38c75cf236f8', 'Game');
// script/Game/Game.js

var Board = require('Board');
var Cell = require('Cell');
var Cube = require('Cube');
var CubeGroup = require('CubeGroup');
var AudioControl = require('AudioControl');

var Game = Fire.defineComponent(function() {
    this.board = null;
    this.cubeGroup = null;
    this.cubeGroupList = [];
    this.fraction = 0;//--当前分数
	
    this.idleCellList = [];//-- 场上空闲的格�
	
    this.scoreText = null;
    this._scoreValue = null;
    
    // 分数上涨动画
    this.isJump = false;
    this.jumpFirst = true;
    
    Game.instance = this;
});

Game.instance = null;

Game.prototype.onLoad = function () {

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
    if (this.cubeGroupList.length === 0) {
        this.cubeGroupList = this.cubeGroup.create3(32);
    }

    var soceObj = Fire.Entity.find("/Score/value");
    this._scoreValue = soceObj.getComponent(Fire.BitmapText);

};

Game.prototype.update = function() {
	if (this.isJump) {
        this.jumpAnimation();
    }
};

//-- �方块组放到棋盘�
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

        //-- 添加分数
        this.addFraction(curbCount);
        cubeGroup.destroy();

        //-- 清除满格
        this.removeLine();

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
            delCubeList[j].readyClear = true;
            delCubeList[j].cube.playAnimation();
        }
    }
    for (i = 0; i < this.board.delCubeColList.length; i++) {
        delCubeList = this.board.delCubeColList[i];
        for (j = 0; j < delCubeList.length; j++) {
            delCubeList[j].readyClear = true;
            delCubeList[j].cube.playAnimation();
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

    this._scoreValue.text = this.fraction;
};

Game.prototype.updateIdleCellList = function () {
    this.idleCellList = [];
    for (var x = 0; x < this.board.count.x; ++x) {
        for (var y = 0; y < this.board.count.x; ++y) {
            var cell = this.board.getCell(x, y);
            if (!cell.hasCube || (cell.cube && cell.readyClear)) {
                this.idleCellList.push(cell);
            }
        }
    }
};

Game.prototype.jumpAnimation = function () {
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
}

Game.prototype.pass = function () {
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
};

Game.prototype.gameOver = function () {
    var scoreBitmapText = this.scoreText.getComponent(Fire.BitmapText)
    scoreBitmapText.text = this.fraction;
    var gameOverBoard = Fire.Entity.find('/GameOver');
    gameOverBoard.transform.scale = new Fire.Vec2(1,1);
    this.isScore = true;
};

module.exports = Game;


Fire._RFpop();
},{"AudioControl":"AudioControl","Board":"Board","Cell":"Cell","Cube":"Cube","CubeGroup":"CubeGroup"}],"MainMenu":[function(require,module,exports){
Fire._RFpush('49613786df3344ea98ede46a5af69786', 'MainMenu');
// script/Menu/MainMenu.js

var MainMenu = Fire.defineComponent(function(){
    
});

//MainMenu.prop('')

MainMenu.prototype.onLoad = function(){

    this.gameUUID = "e958312b-03e3-4a03-a2fe-6e7f40f634d6";
    
	var btnPlay = Fire.Entity.find("/btn_play");
	btnPlay.on("mouseup", function () {
	    Fire.Engine.loadScene(this.gameUUID);
	}.bind(this));
    
};

Fire._RFpop();
},{}],"Toggle":[function(require,module,exports){
Fire._RFpush('e0ac2b810a73466d9f305d401ca23234', 'Toggle');
// script/UI/Toggle.js

var Toggle = Fire.defineComponent(function () { 
	this._btnRender = null;
    this._tiggle = false;
});

Toggle.prop('normal', null, Fire.ObjectType(Fire.Sprite));

Toggle.prop('pressed', null, Fire.ObjectType(Fire.Sprite));

Toggle.prototype.onLoad = function () {

    this._btnRender = this.entity.getComponent(Fire.SpriteRenderer);
    
    this._btnRender.sprite = this.normal;
    
    this.entity.on('mousedown', function () {
        this._tiggle = !this._tiggle;
        if(this._tiggle) {
	        this._btnRender.sprite = this.pressed;
        }
        else{
	        this._btnRender.sprite = this.normal;
        }
    }.bind(this));
};

Fire._RFpop();
},{}]},{},["AudioControl","Board","Cell","Cube","CubeGroup","Game","GameMenu","MainMenu","Button","Toggle"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0dhbWUvQXVkaW9Db250cm9sLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvR2FtZS9Cb2FyZC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L1VJL0J1dHRvbi5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0dhbWUvQ2VsbC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0dhbWUvQ3ViZUdyb3VwLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvR2FtZS9DdWJlLmpzIiwiLi4vLi4vLi4vZGV2L2Jpbi9zY3JpcHQvR2FtZS9HYW1lTWVudS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L0dhbWUvR2FtZS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc2NyaXB0L01lbnUvTWFpbk1lbnUuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NjcmlwdC9VSS9Ub2dnbGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9LQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDam5CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JPQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcEJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJGaXJlLl9SRnB1c2goJzM4ZjE2NGU5YzJiODQ0YmFhNDZmMGQ0ZDdkNzIwNWRkJywgJ0F1ZGlvQ29udHJvbCcpO1xuLy8gc2NyaXB0L0dhbWUvQXVkaW9Db250cm9sLmpzXG5cbnZhciBBdWRpb0NvbnRyb2wgPSB7fTtcblxuQXVkaW9Db250cm9sLnBsYXlfZmluaXNoZWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIEF1ZGlvX2ZpbmlzaGVkID0gRmlyZS5FbnRpdHkuZmluZCgnL0F1ZGlvL2RvbmUnKTtcbiAgICB2YXIgYXVkaW8gPSBBdWRpb19maW5pc2hlZC5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgYXVkaW8ucGxheSgpO1xufTtcblxuQXVkaW9Db250cm9sLnBsYXlfYm9ibyA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgQXVkaW9fYm9ibyA9IEZpcmUuRW50aXR5LmZpbmQoJy9BdWRpby9ib2JvJyk7XG4gICAgdmFyIGF1ZGlvID0gQXVkaW9fYm9iby5nZXRDb21wb25lbnQoRmlyZS5BdWRpb1NvdXJjZSk7XG4gICAgYXVkaW8ucGxheSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBdWRpb0NvbnRyb2w7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKCdmYmJiMTZhN2Y0YTg0ZmY1OWVmNjg5NjQ5YzMxNjhlYycsICdCb2FyZCcpO1xuLy8gc2NyaXB0L0dhbWUvQm9hcmQuanNcblxudmFyIENlbGwgPSByZXF1aXJlKCdDZWxsJyk7XG52YXIgQ3ViZSA9IHJlcXVpcmUoJ0N1YmUnKTtcblxudmFyIEJvYXJkID0gRmlyZS5kZWZpbmVDb21wb25lbnQoZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuX3RlbXBHcmlkID0gbnVsbDtcblxuICAgIHRoaXMuZGVsQ3ViZVJvd0xpc3QgPSBbXTtcbiAgICB0aGlzLmRlbEN1YmVDb2xMaXN0ID0gW107XG59KTtcblxuQm9hcmQucHJvcChcIl9ib2FyZFwiLCBbXSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuXG5Cb2FyZC5wcm9wKFwiZ3JpZFwiLCBudWxsLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5FbnRpdHkpLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG5cbkJvYXJkLnByb3AoXCJjb3VudFwiLCBuZXcgRmlyZS5WZWMyKDEwLCAxMCkpO1xuXG5Cb2FyZC5wcm9wKFwic2l6ZVwiLCBuZXcgRmlyZS5WZWMyKDMwLCAzMCkpO1xuXG5Cb2FyZC5wcm9wKFwic3BhY2luZ1wiLCAyLCBGaXJlLkludGVnZXIpO1xuXG5Cb2FyZC5wcm9wKFwiX2NyZWF0ZU9yQ2xlYW5cIiwgZmFsc2UsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbkJvYXJkLmdldHNldChcImNyZWF0ZU9yQ2xlYW5cIixcbiAgICBmdW5jdGlvbiAoKSB7IHJldHVybiB0aGlzLl9jcmVhdGVPckNsZWFuOyB9LFxuICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICBpZiAodmFsdWUgIT0gdGhpcy5fY3JlYXRlT3JDbGVhbikge1xuICAgICAgICAgICAgdGhpcy5fY3JlYXRlT3JDbGVhbiA9IHZhbHVlO1xuICAgICAgICAgICAgaWYgKHRoaXMuX2NyZWF0ZU9yQ2xlYW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNyZWF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jbGVhbigpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG59KTtcblxuLy8tLSDliJvlu7rmo4vnm5jmoLzlrZBcbkJvYXJkLnByb3RvdHlwZS5jcmVhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5fYm9hcmQgPSBbXTtcblxuICAgIGlmICghdGhpcy5fdGVtcEdyaWQpIHtcbiAgICAgICAgdGhpcy5fdGVtcEdyaWQgPSBGaXJlLkVudGl0eS5maW5kKCcvUHJlZmFicy9jdWJlJyk7XG4gICAgfVxuICAgIHZhciB3aWR0aFggPSAodGhpcy5zaXplLnggKyB0aGlzLnNwYWNpbmcpO1xuICAgIHZhciB3aWR0aFkgPSAodGhpcy5zaXplLnkgKyB0aGlzLnNwYWNpbmcpO1xuICAgIGZvciAodmFyIHggPSAwLCBsZW4gPSB0aGlzLmNvdW50Lng7IHggPCBsZW47ICsreCkge1xuICAgICAgICB0aGlzLl9ib2FyZFt4XSA9IFtdO1xuICAgICAgICBmb3IgKHZhciB5ID0gMCwgbGVuID0gdGhpcy5jb3VudC55OyB5IDwgbGVuOyArK3kpIHtcbiAgICAgICAgICAgIHZhciBlbnRpdHkgPSBGaXJlLmluc3RhbnRpYXRlKHRoaXMuX3RlbXBHcmlkKTtcbiAgICAgICAgICAgIGVudGl0eS5wYXJlbnQgPSB0aGlzLmVudGl0eTtcbiAgICAgICAgICAgIGVudGl0eS5uYW1lID0geCArIFwiOlwiICsgeTtcbiAgICAgICAgICAgIC8vdmFyIHN0YXJ0UG9zWCA9ICgod2lkdGhYICogdGhpcy5jb3VudC54KSAvIDIpIC0gKHdpZHRoWCAvIDIpO1xuICAgICAgICAgICAgLy92YXIgc3RhcnRQb3NZID0gKCh3aWR0aFkgKiB0aGlzLmNvdW50LnkpIC8gMikgLSAod2lkdGhZIC8gMik7XG4gICAgICAgICAgICBlbnRpdHkudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMih4ICogd2lkdGhYLCB5ICogd2lkdGhZKTtcbiAgICAgICAgICAgIHZhciByZW5kZXJlciA9IGVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcik7XG4vLyAgICAgICAgICAgICByZW5kZXJlci5jb2xvciA9IG5ldyBGaXJlLkNvbG9yKDExNSAvIDI1NSwgMTE1IC8gMjU1LCAxMTUgLyAyNTUsIDEpO1xuICAgICAgICAgICAgdmFyIGNlbGwgPSBlbnRpdHkuYWRkQ29tcG9uZW50KENlbGwpO1xuICAgICAgICAgICAgY2VsbC5vZmZzZXQgPSBuZXcgRmlyZS5WZWMyKHgsIHkpO1xuICAgICAgICAgICAgdGhpcy5fYm9hcmRbeF1beV0gPSBjZWxsO1xuICAgICAgICB9XG4gICAgfSAgICBcbiAgICB0aGlzLl9jcmVhdGVPckNsZWFuID0gdHJ1ZTtcbn07XG5cbkJvYXJkLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgLy8tLSDliKTmlq3ooYzmmK/lkKblj6/ku6XmtojpmaRcbiAgICB0aGlzLmVudGl0eS5vbihcInB1dEN1YmVcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBjZWxsID0gZXZlbnQudGFyZ2V0LmdldENvbXBvbmVudChDZWxsKTtcbiAgICAgICAgdGhpcy5kZWxsaW5lKGNlbGwpO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG5Cb2FyZC5wcm90b3R5cGUuZGVsbGluZSA9IGZ1bmN0aW9uIChjZWxsKSB7XG4gICAgdmFyIGNsZWFyUm93ID0gdHJ1ZSwgY2xlYXJDb2wgPSB0cnVlO1xuICAgIHZhciB0ZW1wQ2VsbCA9IG51bGw7XG4gICAgdmFyIHggPSAwLCB5ID0gMDtcbiAgICB2YXIgdGVtcERlbEN1YmVSb3dMaXN0ID0gW11cbiAgICB2YXIgdGVtcERlbEN1YmVDb2xMaXN0ID0gW11cbiAgICBmb3IgKHggPSBjZWxsLm9mZnNldC54OyB4ID49IDA7IC0teCkge1xuICAgICAgICB0ZW1wQ2VsbCA9IHRoaXMuZ2V0Q2VsbCh4LCBjZWxsLm9mZnNldC55KTtcbiAgICAgICAgaWYgKCF0ZW1wQ2VsbC5oYXNDdWJlKSB7XG4gICAgICAgICAgICBjbGVhclJvdyA9IGZhbHNlO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0ZW1wRGVsQ3ViZVJvd0xpc3QucHVzaCh0ZW1wQ2VsbCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgaWYgKGNsZWFyUm93KSB7XG4gICAgICAgIGZvciAoeCA9IGNlbGwub2Zmc2V0Lng7IHggPCB0aGlzLmNvdW50Lng7ICsreCkge1xuICAgICAgICAgICAgdGVtcENlbGwgPSB0aGlzLmdldENlbGwoeCwgY2VsbC5vZmZzZXQueSk7XG4gICAgICAgICAgICBpZiAoIXRlbXBDZWxsLmhhc0N1YmUpIHtcbiAgICAgICAgICAgICAgICBjbGVhclJvdyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgdGVtcERlbEN1YmVSb3dMaXN0LnB1c2godGVtcENlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoeSA9IGNlbGwub2Zmc2V0Lnk7IHkgPj0gMDsgLS15KSB7XG4gICAgICAgIHRlbXBDZWxsID0gdGhpcy5nZXRDZWxsKGNlbGwub2Zmc2V0LngsIHkpO1xuICAgICAgICBpZiAoIXRlbXBDZWxsLmhhc0N1YmUpIHtcbiAgICAgICAgICAgIGNsZWFyQ29sID0gZmFsc2U7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHRlbXBEZWxDdWJlQ29sTGlzdC5wdXNoKHRlbXBDZWxsKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoY2xlYXJDb2wpIHtcbiAgICAgICAgZm9yICh5ID0gY2VsbC5vZmZzZXQueTsgeSA8IHRoaXMuY291bnQueTsgKyt5KSB7XG4gICAgICAgICAgICB0ZW1wQ2VsbCA9IHRoaXMuZ2V0Q2VsbChjZWxsLm9mZnNldC54LCB5KTtcbiAgICAgICAgICAgIGlmICghdGVtcENlbGwuaGFzQ3ViZSkge1xuICAgICAgICAgICAgICAgIGNsZWFyQ29sID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICB0ZW1wRGVsQ3ViZUNvbExpc3QucHVzaCh0ZW1wQ2VsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoY2xlYXJSb3cpIHtcbiAgICAgICAgdGhpcy5kZWxDdWJlUm93TGlzdC5wdXNoKHRlbXBEZWxDdWJlUm93TGlzdCk7XG4gICAgfVxuICAgIGlmIChjbGVhckNvbCkge1xuICAgICAgICB0aGlzLmRlbEN1YmVDb2xMaXN0LnB1c2godGVtcERlbEN1YmVDb2xMaXN0KTtcbiAgICB9XG4gICAgXG59O1xuXG5cbi8vLS0g5riF56m65qOL55uYXG5Cb2FyZC5wcm90b3R5cGUuY2xlYW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGxlbiA9IDA7XG4gICAgZm9yICh2YXIgeCA9IDAsIGxlbiA9IHRoaXMuY291bnQueDsgeCA8IGxlbjsgKyt4KSB7XG4gICAgICAgIGZvciAodmFyIHkgPSAwLCBsZW4gPSB0aGlzLmNvdW50Lnk7IHkgPCBsZW47ICsreSkge1xuICAgICAgICAgICAgaWYodGhpcy5fYm9hcmRbeF1beV0pe1xuICAgICAgICAgICAgXHR0aGlzLl9ib2FyZFt4XVt5XS5lbnRpdHkuZGVzdHJveSgpO1xuICAgICAgICAgICAgXHRpZiAoIUZpcmUuRW5naW5lLmlzUGxheWluZykge1xuICAgICAgICAgICAgXHQgICAgRmlyZS5GT2JqZWN0Ll9kZWZlcnJlZERlc3Ryb3koKTtcbiAgICAgICAgICAgIFx0fVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHRoaXMuX2JvYXJkID0gW107XG4gICAgdGhpcy5fY3JlYXRlT3JDbGVhbiA9IGZhbHNlO1xufTtcblxuLy8tLSAg6YCa6L+HWCBZIOiOt+WPlkNlbGzvvIhYIDAtOe+8iShZIDAtOSlcbkJvYXJkLnByb3RvdHlwZS5nZXRDZWxsID0gZnVuY3Rpb24gKHgsIHkpIHtcbiAgICBpZiAoeCA+IC0xICYmIHggPCAxMCAmJiB5ID4gLTEgJiYgeSA8IDEwKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9ib2FyZFt4XVt5XTtcbiAgICB9XG4gICAgcmV0dXJuIG51bGw7XG59O1xuXG4vLy0tIOWIpOaWreaYr+WQpuWPr+S7peWcqOagvOWtkOS4iuaUvue9ruaWueWdl1xuQm9hcmQucHJvdG90eXBlLmNhblB1dEN1YmVUb0NlbGwgPSBmdW5jdGlvbiAoY3ViZUdyb3VwLCBjZW50ZXIpIHtcbiAgICBmb3IgKHZhciBqID0gMCwgbGVuID0gY3ViZUdyb3VwLl9jaGlsZHJlbi5sZW5ndGg7IGogPCBsZW47ICsraikge1xuICAgICAgICB2YXIgY3ViZSA9IGN1YmVHcm91cC5fY2hpbGRyZW5bal0uZ2V0Q29tcG9uZW50KEN1YmUpO1xuICAgICAgICB2YXIgcG9zID0gY3ViZS5wb3NpdGlvbjtcbiAgICAgICAgdmFyIGNlbGwgPSB0aGlzLmdldENlbGwoY2VudGVyLnggKyBwb3MueCwgY2VudGVyLnkgKyBwb3MueSk7XG4gICAgICAgIGlmICghY2VsbCB8fCAoY2VsbC5oYXNDdWJlICYmICFjZWxsLnJlYWR5Q2xlYXIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEJvYXJkO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaCgnY2MzMDRhM2NhNDRlNDM0ODhiOWM0MDBkOWZhYjg5NDUnLCAnQnV0dG9uJyk7XG4vLyBzY3JpcHQvVUkvQnV0dG9uLmpzXG5cbnZhciBCdXR0b24gPSBGaXJlLmRlZmluZUNvbXBvbmVudChmdW5jdGlvbiAoKSB7IFxuXHR0aGlzLl9idG5SZW5kZXIgPSBudWxsO1xufSk7XG5cbkJ1dHRvbi5wcm9wKCdub3JtYWwnLCBudWxsLCBGaXJlLk9iamVjdFR5cGUoRmlyZS5TcHJpdGUpKTtcblxuQnV0dG9uLnByb3AoJ2hvdmVyJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuU3ByaXRlKSk7XG5cbkJ1dHRvbi5wcm9wKCdwcmVzc2VkJywgbnVsbCwgRmlyZS5PYmplY3RUeXBlKEZpcmUuU3ByaXRlKSk7XG5cbkJ1dHRvbi5wcm9wKCdkaXNhYmxlZCcsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLlNwcml0ZSkpO1xuXG5CdXR0b24ucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuX2J0blJlbmRlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICBcbiAgICB0aGlzLl9idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5ub3JtYWw7XG4gICAgXG4gICAgdGhpcy5lbnRpdHkub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMucHJlc3NlZDtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5lbnRpdHkub24oJ21vdXNldXAnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX2J0blJlbmRlci5zcHJpdGUgPSB0aGlzLm5vcm1hbDtcbiAgICB9LmJpbmQodGhpcykpO1xuXG59O1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaCgnZDJhMzU4MjAxZTZkNGEzNmI3ZmQ5MjM2OWMzZGQzNmQnLCAnQ2VsbCcpO1xuLy8gc2NyaXB0L0dhbWUvQ2VsbC5qc1xuXG52YXIgQ2VsbCA9IEZpcmUuZGVmaW5lQ29tcG9uZW50KCk7XG5cbkNlbGwucHJvcCgnb2Zmc2V0JywgbmV3IEZpcmUuVmVjMigwLCAwKSk7XG5DZWxsLnByb3AoJ2hhc0N1YmUnLCBmYWxzZSk7XG5DZWxsLnByb3AoJ2N1YmUnLCBudWxsLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG5DZWxsLnByb3AoJ3JlYWR5Q2xlYXInLCBmYWxzZSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuXG5DZWxsLnByb3RvdHlwZS5jbGVhbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZW50aXR5LmRlc3Ryb3koKTtcbn07XG5cbkNlbGwucHJvdG90eXBlLnB1dEN1YmUgPSBmdW5jdGlvbiAoY3ViZSkge1xuICAgIGN1YmUuZW50aXR5LnBhcmVudCA9IHRoaXMuZW50aXR5O1xuICAgIGN1YmUudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigwLCAwKTtcbiAgICB0aGlzLmhhc0N1YmUgPSB0cnVlO1xuICAgIHRoaXMuY3ViZSA9IGN1YmU7XG4gICAgXG4gICAgLy8tLSDnu5Hlrprlt7Lnu4/mlL7nva7mlrnlnZfmtojmga9cbiAgICB0aGlzLmVudGl0eS5kaXNwYXRjaEV2ZW50KG5ldyBGaXJlLkV2ZW50KFwicHV0Q3ViZVwiLCB0cnVlKSk7XG4gICAgLy8tLSDnu5HlrppDdWJl6ZSA5q+B5raI5oGvXG4gICAgdGhpcy5lbnRpdHkub24oXCJjdXJiIGNsZWFyXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5oYXNDdWJlID0gZmFsc2U7XG4gICAgICAgIHRoaXMucmVhZHlDbGVhciA9IGZhbHNlO1xuICAgICAgICB0aGlzLmN1YmUgPSBudWxsO1xuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IENlbGw7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKCc5MzFiZmNmOGQwMzE0MTBmOWU3ZGFlY2EyNzljZWRhZScsICdDdWJlR3JvdXAnKTtcbi8vIHNjcmlwdC9HYW1lL0N1YmVHcm91cC5qc1xuXG52YXIgQ3ViZUdyb3VwID0gRmlyZS5kZWZpbmVDb21wb25lbnQoZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuc3RvcEFuaW1hdGlvbiA9IHRydWU7XG59KTtcblxudmFyIEN1YmUgPSByZXF1aXJlKCdDdWJlJyk7XG5cbnZhciB0aGlzVHJhbnNmb3JtID0gbnVsbDtcblxudmFyIEF1ZGlvQ29udHJvbCA9IHJlcXVpcmUoJ0F1ZGlvQ29udHJvbCcpO1xuXG52YXIgdGhpc0dyb3VwID0gbnVsbDtcblxudmFyIGNhbWVyYSA9IG51bGw7XG5cbkN1YmVHcm91cC5wcm9wKFwiX2NyZWF0Q3ViZXNcIiwgZmFsc2UsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcblxuQ3ViZUdyb3VwLnByb3AoJ19jcmVhdFRocmVlJywgZmFsc2UsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcblxuQ3ViZUdyb3VwLmdldHNldCgnQ3JlYXRUaHJlZScsXG5cbmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdFRocmVlO1xufSxcbmZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9IHRoaXMuX2NyZWF0VGhyZWUpIHtcbiAgICAgICAgdGhpcy5fY3JlYXRUaHJlZSA9IHZhbHVlO1xuICAgIH1cbiAgICBpZiAodmFsdWUpIHtcbiAgICAgICAgdGhpcy5jcmVhdGUzKDMyKTtcbiAgICB9XG59KTtcblxuQ3ViZUdyb3VwLmdldHNldChcIkNyZWF0Q3ViZXNcIixcblxuZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX2NyZWF0Q3ViZXM7XG59LFxuXG5mdW5jdGlvbih2YWx1ZSkge1xuICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fY3JlYXRDdWJlcykge1xuICAgICAgICB0aGlzLl9jcmVhdEN1YmVzID0gdmFsdWU7XG4gICAgICAgIGlmICh2YWx1ZSkge1xuICAgICAgICAgICAgdmFyIG9iaiA9IHRoaXMuY3JlYXRlUmFuZG9tKDMyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG52YXIgQm94XzkgPSBbe1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAtMVxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMVxufSxcbntcbiAgICBcInlcIjogLTEsXG4gICAgXCJ4XCI6IDBcbn0sXG57XG4gICAgXCJ5XCI6IC0xLFxuICAgIFwieFwiOiAxXG59LFxue1xuICAgIFwieVwiOiAtMSxcbiAgICBcInhcIjogLTFcbn0sXG57XG4gICAgXCJ5XCI6IDEsXG4gICAgXCJ4XCI6IC0xXG59LFxue1xuICAgIFwieVwiOiAxLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAxLFxuICAgIFwieFwiOiAxXG59LFxuXTsgLy8g55SwICozXG5cbnZhciBDdXJ2ZWRfM18wID0gW3tcbiAgICBcInlcIjogMSxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMVxufSxcbl07IC8vTCAqMyAgMFxudmFyIEN1cnZlZF8zXzkwID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogLTEsXG4gICAgXCJ4XCI6IDBcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDFcbn0sXG5dOyAvL0wgKjMgOTBcbnZhciBDdXJ2ZWRfM18xODAgPSBbe1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAtMVxufSxcbntcbiAgICBcInlcIjogLTEsXG4gICAgXCJ4XCI6IDBcbn0sXG5dOyAvL0wgKjMgMTgwXG52YXIgQ3VydmVkXzNfMjcwID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogLTFcbn0sXG57XG4gICAgXCJ5XCI6IDEsXG4gICAgXCJ4XCI6IDBcbn0sXG5dOyAvL0wgKjMgMjcwXG5cbnZhciBDdXJ2ZWRfNV8wID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMSxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMixcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMVxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMlxufSxcbl07IC8vTCAqNSAwXG52YXIgQ3VydmVkXzVfOTAgPSBbe1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAxXG59LFxue1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAyXG59LFxue1xuICAgIFwieVwiOiAtMSxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogLTIsXG4gICAgXCJ4XCI6IDBcbn0sXG5dOyAvL0wgKjUgMCA5MFxudmFyIEN1cnZlZF81XzE4MCA9IFt7XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDBcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IC0xXG59LFxue1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAtMlxufSxcbntcbiAgICBcInlcIjogLTEsXG4gICAgXCJ4XCI6IDBcbn0sXG57XG4gICAgXCJ5XCI6IC0yLFxuICAgIFwieFwiOiAwXG59LFxuXTsgLy9MICo1IDAgMTgwXG52YXIgQ3VydmVkXzVfMjcwID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogLTFcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IC0yXG59LFxue1xuICAgIFwieVwiOiAyLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAxLFxuICAgIFwieFwiOiAwXG59LFxuXTsgLy9MICo1IDAgMjcwXG52YXIgQm94XzQgPSBbe1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAxXG59LFxue1xuICAgIFwieVwiOiAxLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAxLFxuICAgIFwieFwiOiAxXG59LFxuXTtcblxudmFyIEJveF8xID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbl07XG5cbnZhciBMaW5lXzJfMCA9IFt7XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDBcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDFcbn0sXG5dOyAvLyAtLSAqMiAwXG52YXIgTGluZV8yXzkwID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMSxcbiAgICBcInhcIjogMFxufSxcbl07IC8vIEkgKjIgOTBcbnZhciBMaW5lXzNfMCA9IFt7XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDBcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IC0xXG59LFxue1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAxXG59LFxuXTsgLy8gLS0tICozIDBcbnZhciBMaW5lXzNfOTAgPSBbe1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAxLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAtMSxcbiAgICBcInhcIjogMFxufSxcbl07IC8vIC0tLSAqMyA5MFxudmFyIExpbmVfNF8wID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogLTFcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDFcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDJcbn0sXG5dOyAvLyAtLS0tICo0IDBcbnZhciBMaW5lXzRfOTAgPSBbe1xuICAgIFwieVwiOiAwLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAtMSxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMSxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMixcbiAgICBcInhcIjogMFxufSxcbl07IC8vLS0tLSAqNCA5MFxudmFyIExpbmVfNV8wID0gW3tcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMCxcbiAgICBcInhcIjogLTFcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDFcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDJcbn0sXG57XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IC0yXG59LFxuXTtcblxudmFyIExpbmVfNV85MCA9IFt7XG4gICAgXCJ5XCI6IDAsXG4gICAgXCJ4XCI6IDBcbn0sXG57XG4gICAgXCJ5XCI6IC0xLFxuICAgIFwieFwiOiAwXG59LFxue1xuICAgIFwieVwiOiAtMixcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMSxcbiAgICBcInhcIjogMFxufSxcbntcbiAgICBcInlcIjogMixcbiAgICBcInhcIjogMFxufSxcbl07XG5cbkN1YmVHcm91cC5wcm90b3R5cGUuX2dyaWRUeXBlID0gW0JveF85LCBCb3hfNCwgQm94XzEsIEN1cnZlZF8zXzAsIEN1cnZlZF8zXzkwLCBDdXJ2ZWRfM18xODAsIEN1cnZlZF8zXzI3MCwgQ3VydmVkXzVfMCwgQ3VydmVkXzVfOTAsIEN1cnZlZF81XzE4MCwgQ3VydmVkXzVfMjcwLCBMaW5lXzJfMCwgTGluZV8yXzkwLCBMaW5lXzNfMCwgTGluZV8zXzkwLCBMaW5lXzRfMCwgTGluZV80XzkwLCBMaW5lXzVfMCwgTGluZV81XzkwXTtcblxudmFyIEdyaWRUeXBlID0gKGZ1bmN0aW9uKHQpIHtcbiAgICB0W3QuQm94XzkgPSAwXSA9ICdCb3hfOSc7XG4gICAgdFt0LkJveF80ID0gMV0gPSAnQm94XzQnO1xuICAgIHRbdC5Cb3hfMSA9IDJdID0gJ0JveF8xJztcbiAgICB0W3QuQ3VydmVkXzNfMCA9IDNdID0gJ0N1cnZlZF8zXzAnO1xuICAgIHRbdC5DdXJ2ZWRfM185MCA9IDRdID0gJ0N1cnZlZF8zXzkwJztcbiAgICB0W3QuQ3VydmVkXzNfMTgwID0gNV0gPSAnQ3VydmVkXzNfMTgwJztcbiAgICB0W3QuQ3VydmVkXzNfMjcwID0gNl0gPSAnQ3VydmVkXzNfMjcwJztcbiAgICB0W3QuQ3VydmVkXzVfMCA9IDddID0gJ0N1cnZlZF81XzAnO1xuICAgIHRbdC5DdXJ2ZWRfNV85MCA9IDhdID0gJ0N1cnZlZF81XzkwJztcbiAgICB0W3QuQ3VydmVkXzVfMTgwID0gOV0gPSAnQ3VydmVkXzVfMTgwJztcbiAgICB0W3QuQ3VydmVkXzVfMjcwID0gMTBdID0gJ0N1cnZlZF81XzI3MCc7XG4gICAgdFt0LkxpbmVfMl8wID0gMTFdID0gJ0xpbmVfMl8wJztcbiAgICB0W3QuTGluZV8yXzkwID0gMTJdID0gJ0xpbmVfMl85MCc7XG4gICAgdFt0LkxpbmVfM18wID0gMTNdID0gJ0xpbmVfM18wJztcbiAgICB0W3QuTGluZV8zXzkwID0gMTRdID0gJ0xpbmVfM185MCc7XG4gICAgdFt0LkxpbmVfNF8wID0gMTVdID0gJ0xpbmVfNF8wJztcbiAgICB0W3QuTGluZV80XzkwID0gMTZdID0gJ0xpbmVfNF85MCc7XG4gICAgdFt0LkxpbmVfNV8wID0gMTddID0gJ0xpbmVfNV8wJztcbiAgICB0W3QuTGluZV81XzkwID0gMThdID0gJ0xpbmVfNV85MCc7XG4gICAgcmV0dXJuIHQ7XG59KSh7fSk7XG5cbkN1YmVHcm91cC5wcm9wKFwiX3NlbGVjdFwiLCBHcmlkVHlwZS5Cb3hfOSwgRmlyZS5FbnVtKEdyaWRUeXBlKSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuXG5DdWJlR3JvdXAuZ2V0c2V0KCdzZWxlY3QnLFxuZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3NlbGVjdDtcbn0sXG5mdW5jdGlvbih2YWx1ZSkge1xuICAgIC8vaWYgKHRoaXNHcm91cC5pc1ZhbGlkKSB7XG4gICAgLy8gICAgdGhpcy5jbGVhcigpO1xuICAgIC8vfVxuICAgIGlmICh2YWx1ZSAhPSB0aGlzLl9zZWxlY3QpIHtcbiAgICAgICAgdGhpcy5fc2VsZWN0ID0gdmFsdWU7XG4gICAgICAgIC8vdGhpcy5jcmVhdGUoMzIsIHRoaXMuX2dyaWRUeXBlW3ZhbHVlXSk7XG4gICAgfVxufSxcbkZpcmUuRW51bShHcmlkVHlwZSkpO1xuXG5DdWJlR3JvdXAucHJvdG90eXBlLmdyaWRUeXBlID0ge1xuICAgIFwiQm94XzlcIjogQm94XzksXG4gICAgXCJCb3hfNFwiOiBCb3hfNCxcbiAgICBcIkJveF8xXCI6IEJveF8xLFxuICAgIFwiQ3VydmVkXzNfMFwiOiBDdXJ2ZWRfM18wLFxuICAgIFwiQ3VydmVkXzNfOTBcIjogQ3VydmVkXzNfOTAsXG4gICAgXCJDdXJ2ZWRfM18xODBcIjogQ3VydmVkXzNfMTgwLFxuICAgIFwiQ3VydmVkXzNfMjcwXCI6IEN1cnZlZF8zXzI3MCxcbiAgICBcIkN1cnZlZF81XzBcIjogQ3VydmVkXzVfMCxcbiAgICBcIkN1cnZlZF81XzkwXCI6IEN1cnZlZF81XzkwLFxuICAgIFwiQ3VydmVkXzVfMTgwXCI6IEN1cnZlZF81XzE4MCxcbiAgICBcIkN1cnZlZF81XzI3MFwiOiBDdXJ2ZWRfNV8yNzAsXG4gICAgXCJMaW5lXzJfMFwiOiBMaW5lXzJfMCxcbiAgICBcIkxpbmVfMl85MFwiOiBMaW5lXzJfOTAsXG4gICAgXCJMaW5lXzNfMFwiOiBMaW5lXzNfMCxcbiAgICBcIkxpbmVfM185MFwiOiBMaW5lXzNfOTAsXG4gICAgXCJMaW5lXzRfMFwiOiBMaW5lXzRfMCxcbiAgICBcIkxpbmVfNF85MFwiOiBMaW5lXzRfOTAsXG4gICAgXCJMaW5lXzVfMFwiOiBMaW5lXzVfMCxcbiAgICBcIkxpbmVfNV85MFwiOiBMaW5lXzVfOTBcbn07XG5cbi8vL2NvbG9yXG52YXIgYmx1ZSA9IG5ldyBGaXJlLkNvbG9yKDk3IC8gMjU1LCAxOTAgLyAyNTUsIDIyNyAvIDI1NSwgMSk7XG52YXIgeWVsbG93ID0gbmV3IEZpcmUuQ29sb3IoMjUzIC8gMjU1LCAxOTcgLyAyNTUsIDc2IC8gMjU1LCAxKTtcbnZhciByZWQgPSBuZXcgRmlyZS5Db2xvcigyMTggLyAyNTUsIDE5MiAvIDI1NSwgOTAgLyAyNTUsIDEpO1xudmFyIGxpZ2h0Ymx1ZSA9IG5ldyBGaXJlLkNvbG9yKDgzIC8gMjU1LCAyMTEgLyAyNTUsIDE3NCAvIDI1NSwgMSk7XG52YXIgcGluayA9IG5ldyBGaXJlLkNvbG9yKDIyOSAvIDI1NSwgMTA3IC8gMjU1LCAxMjkgLyAyNTUsIDEpO1xudmFyIG9yYW5nZSA9IG5ldyBGaXJlLkNvbG9yKDI0My8yNTUsODAvMjU1LDEyLzI1NSwxKTtcbnZhciBncmVlbiA9IG5ldyBGaXJlLkNvbG9yKDg1LzI1NSwxOTIvMjU1LDY3LzI1NSwxKTtcblxuQ3ViZUdyb3VwLnByb3RvdHlwZS5fQ29sb3JzID0gW2JsdWUsIHllbGxvdywgcmVkLCBsaWdodGJsdWUsIHBpbmssb3JhbmdlLGdyZWVuXTtcblxuQ3ViZUdyb3VwLnByb3RvdHlwZS5Db2xvcnMgPSB7XG4gICAgXCJibHVlXCI6IGJsdWUsXG4gICAgXCJ5ZWxsb3dcIjogeWVsbG93LFxuICAgIFwicmVkXCI6IHJlZCxcbiAgICBcImxpZ2h0Ymx1ZVwiOiBsaWdodGJsdWUsXG4gICAgXCJwaW5rXCI6IHBpbmssXG4gICAgXCJvcmFuZ2VcIjogb3JhbmdlLFxuICAgIFwiZ3JlZW5cIjogZ3JlZW4sXG59O1xuXG5cbnZhciBzdGFydFggPSAwO1xudmFyIHN0YXJ0WSA9IDA7XG52YXIgaXNNb3VzZVVwID0gdHJ1ZTtcblxuXG52YXIgbW92ZUdyaWQgPSBudWxsO1xuXG4vLy8gKioqKioqKioqKioqKioqKioqKioqKipcbi8vLyAqIHNpemU6IOWNleS4qmN1YmXlpKflsI9cbi8vLyAqIGdyaWRUeXBlOiDmjIflrprnmoRjdWJlR3JvdXBcbi8vLyAqIGNhbGxiYWNrOlxuLy8vICogX2NvbG9yOiBb5Y+v6YCJXSDorr7nva7mjIflrppjb2xvci4g5aaC5p6c5LiN6K6+572u77yM5YiZ6ZqP5py6XG4vLy8gKioqKioqKioqKioqKioqKioqKioqKipcbkN1YmVHcm91cC5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24oc2l6ZSwgZ3JpZFR5cGUsIF9jb2xvcikge1xuICAgIHZhciBjb2xvciA9IHRoaXMuX0NvbG9yc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiA3KV07XG4gICAgaWYgKCAhISBfY29sb3IpIHtcbiAgICAgICAgY29sb3IgPSBfY29sb3I7XG4gICAgfVxuXG4gICAgdmFyIGdyaWQgPSB0aGlzLmVudGl0eS5maW5kKCcuLi9QcmVmYWJzL2N1YmUnKTtcbiAgICB2YXIgZ3JpZEdyb3VwID0gbmV3IEZpcmUuRW50aXR5KCdncm91cCcpO1xuICAgIGdyaWRHcm91cC5wYXJlbnQgPSB0aGlzLmVudGl0eTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgZ3JpZFR5cGUubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIG9iaiA9IEZpcmUuaW5zdGFudGlhdGUoZ3JpZCk7XG4gICAgICAgIG9iai5wYXJlbnQgPSBncmlkR3JvdXA7XG4gICAgICAgIG9iai5uYW1lID0gJ2NoaWxkXycgKyBpO1xuICAgICAgICB2YXIgY3ViZSA9IG9iai5hZGRDb21wb25lbnQoQ3ViZSk7XG5cbiAgICAgICAgY3ViZS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIoZ3JpZFR5cGVbaV0ueCwgZ3JpZFR5cGVbaV0ueSk7XG4gICAgICAgIG9iai5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGVSZW5kZXJlcikuY29sb3IgPSBjb2xvcjtcbiAgICAgICAgb2JqLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBWZWMyKGdyaWRUeXBlW2ldLnggKiBzaXplLCBncmlkVHlwZVtpXS55ICogc2l6ZSk7XG4gICAgfVxuXG4gICAgZ3JpZEdyb3VwLnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIoMC44LDAuOCk7XG5cbiAgICBncmlkR3JvdXAub24oJ21vdXNlZG93bicsXG4gICAgICAgIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIFx0aXNNb3VzZVVwID0gZmFsc2U7XG4gICAgICAgICAgICBtb3ZlR3JpZCA9IGdyaWRHcm91cDtcbiAgICAgICAgXHRtb3ZlR3JpZC50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKDAuOSwwLjkpO1xuICAgICAgICB9LmJpbmQodGhpcylcblx0KTtcblxuICAgIGdyaWRHcm91cC5vbignbW91c2V1cCcsXG4gICAgICAgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgICAgIG1vdmVHcmlkID0gbnVsbDtcbiAgICAgICB9LmJpbmQodGhpcylcbiAgICk7XG5cbiAgICB0aGlzR3JvdXAgPSBncmlkR3JvdXA7XG4gICAgcmV0dXJuIGdyaWRHcm91cDtcbn07XG5cbkN1YmVHcm91cC5wcm90b3R5cGUuY3JlYXRlUmFuZG9tID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgIHZhciByYW4gPSAwO1xuICAgIHJhbiA9IE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE5KTtcbiAgICB2YXIgcmFuR3JpZCA9IHRoaXMuX2dyaWRUeXBlW3Jhbl07XG4gICAgcmV0dXJuIHRoaXMuY3JlYXRlKHNpemUsIHJhbkdyaWQpO1xufTtcblxuQ3ViZUdyb3VwLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24gKG1vdmVYLG1vdmVZLGdyaWQpIHtcbiAgICB2YXIgQ3ViZUdyb3VwUG9zaXRpb24gPSB0aGlzVHJhbnNmb3JtO1xuICAgIHZhciBzY3JlZW5Qb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIobW92ZVgsbW92ZVkpO1xuICAgIHZhciB3b3JkUG9zdGlvbiA9IGNhbWVyYS5zY3JlZW5Ub1dvcmxkKHNjcmVlblBvc2l0aW9uKTtcbiAgICBncmlkLnRyYW5zZm9ybS5wb3NpdGlvbiA9IG5ldyBGaXJlLlZlYzIod29yZFBvc3Rpb24ueCArIEN1YmVHcm91cFBvc2l0aW9uLngsd29yZFBvc3Rpb24ueSAtIEN1YmVHcm91cFBvc2l0aW9uLnkpO1xufTtcblxudmFyIGdyb3VwQm9yYWQgPSBbXTtcbnZhciBncm91cEJvcmFkUG9zaXRpb25zID0gW107XG5cblxuQ3ViZUdyb3VwLnByb3RvdHlwZS5jcmVhdGUzID0gZnVuY3Rpb24oc2l6ZSkge1xuICAgIGdyb3VwQm9yYWRQb3NpdGlvbnMgPSBbXTtcblxuICAgIGdyb3VwQm9yYWQgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDM7IGkrKykge1xuICAgICAgICB2YXIgZ3JvdXAgPSB0aGlzLmNyZWF0ZVJhbmRvbShzaXplKTtcbiAgICAgICAgZ3JvdXAudHJhbnNmb3JtLnBvc2l0aW9uID0gbmV3IEZpcmUuVmVjMigoKCAtIDUgKiBzaXplKSArICg1ICogc2l6ZSkgKiBpKSwgZ3JvdXAudHJhbnNmb3JtLnBvc2l0aW9uLnkpO1xuICAgICAgICB2YXIgeHkgPSB7XCJpZFwiOmdyb3VwLmlkLCdwb3NpdGlvbic6Z3JvdXAudHJhbnNmb3JtLnBvc2l0aW9ufTtcbiAgICAgICAgZ3JvdXBCb3JhZFBvc2l0aW9ucy5wdXNoKHh5KTtcbiAgICAgICAgZ3JvdXBCb3JhZC5wdXNoKGdyb3VwKTtcbiAgICB9XG4gICAgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnNjYWxlID0gbmV3IEZpcmUuVmVjMigwLjAsMC4wKTtcbiAgICB0aGlzLnBsYXkoKTtcblxuICAgIHJldHVybiBncm91cEJvcmFkO1xufTtcblxuQ3ViZUdyb3VwLnByb3RvdHlwZS5jbGVhciA9IGZ1bmN0aW9uKCkge1xuICAgIHRyeSB7XG4gICAgICAgIHRoaXNHcm91cC5kZXN0cm95KCk7XG4gICAgfSBjYXRjaChlKSB7XG5cblx0fVxufTtcblxuQ3ViZUdyb3VwLnByb3RvdHlwZS5yZXNldFBvc2l0aW9uID0gZnVuY3Rpb24oZ3JvdXApIHtcbiAgICB2YXIgdW5kb1Bvc2l0aW9uID0gZ3JvdXAudHJhbnNmb3JtLnBvc2l0aW9uO1xuXHRmb3IodmFyIGkgPTA7IGkgPCBncm91cEJvcmFkLmxlbmd0aDsgaSsrICkge1xuXHRcdGlmIChncm91cEJvcmFkW2ldLmlkID09PSBncm91cC5pZCkge1xuICAgICAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBncm91cEJvcmFkUG9zaXRpb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgaWYgKGdyb3VwQm9yYWRQb3NpdGlvbnNbal0uaWQgPT09IGdyb3VwLmlkKSB7XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwLnRyYW5zZm9ybS5wb3NpdGlvbiA9IGdyb3VwQm9yYWRQb3NpdGlvbnNbal0ucG9zaXRpb247XG4gICAgICAgICAgICAgICAgICAgIGdyb3VwLnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIoMC44LDAuOCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuQ3ViZUdyb3VwLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmIChGaXJlLkVuZ2luZS5pc1BsYXlpbmcpIHtcblxuICAgICAgICB2YXIgR2FtZSA9IHJlcXVpcmUoJ0dhbWUnKTtcblxuICAgICAgICBGaXJlLklucHV0Lm9uKCdtb3VzZWRvd24nLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIHN0YXJ0WCA9IGV2ZW50LnNjcmVlblg7XG4gICAgICAgICAgICBzdGFydFkgPSBldmVudC5zY3JlZW5ZO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNlbW92ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgaWYgKCFpc01vdXNlVXApIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdmUoZXZlbnQuc2NyZWVuWCwgZXZlbnQuc2NyZWVuWSwgbW92ZUdyaWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgIEZpcmUuSW5wdXQub24oJ21vdXNldXAnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGlzTW91c2VVcCA9IHRydWU7XG4gICAgICAgICAgICBpZiAobW92ZUdyaWQpIHtcbiAgICAgICAgICAgICAgICB2YXIgY2FuUHV0ID0gR2FtZS5pbnN0YW5jZS5wdXRCb2FyZChtb3ZlR3JpZCk7XG4gICAgICAgICAgICAgICAgaWYgKCFjYW5QdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5yZXNldFBvc2l0aW9uKG1vdmVHcmlkKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgQXVkaW9Db250cm9sLnBsYXlfYm9ibygpO1xuICAgICAgICAgICAgICAgIG1vdmVHcmlkID0gbnVsbDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICBjYW1lcmEgPSBGaXJlLkVudGl0eS5maW5kKFwiL01haW4gQ2FtZXJhXCIpLmdldENvbXBvbmVudChGaXJlLkNhbWVyYSk7XG4gICAgICAgIHRoaXNUcmFuc2Zvcm0gPSBGaXJlLkVudGl0eS5maW5kKFwiL0N1YmVHcm91cFwiKS50cmFuc2Zvcm0ucG9zaXRpb247XG4gICAgfVxufTtcblxuXG5DdWJlR3JvdXAucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoKSB7XG4gIFx0ICB0aGlzLnN0b3BBbmltYXRpb24gPSBmYWxzZTtcbn07XG5cbkN1YmVHcm91cC5wcm90b3R5cGUuYW5pbWF0aW9uID0gZnVuY3Rpb24gKCkge1xuICB0aGlzLmVudGl0eS50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKHRoaXMuZW50aXR5LnRyYW5zZm9ybS5zY2FsZS54ICsgRmlyZS5UaW1lLmRlbHRhVGltZSAqIDUsIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5zY2FsZS54ICsgRmlyZS5UaW1lLmRlbHRhVGltZSAqIDUpO1xuICAgIGlmICh0aGlzLmVudGl0eS50cmFuc2Zvcm0uc2NhbGUueCArIEZpcmUuVGltZS5kZWx0YVRpbWUgPj0gMSkge1xuICAgICAgICB0aGlzLmVudGl0eS50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKDEsMSk7XG4gICAgICAgIHRoaXMuc3RvcEFuaW1hdGlvbiA9IHRydWU7XG4gICAgfVxufTtcblxuQ3ViZUdyb3VwLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0aWYgKCF0aGlzLnN0b3BBbmltYXRpb24pIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb24oKTtcbiAgICB9XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IEN1YmVHcm91cDtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2goJzFiOTRhZGYxZDQxMTRjNDQ4MGUzYTVmZThlNTljMTliJywgJ0N1YmUnKTtcbi8vIHNjcmlwdC9HYW1lL0N1YmUuanNcblxudmFyIGN1YmUgPSBGaXJlLmRlZmluZUNvbXBvbmVudChmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0b3BBbmltYXRpb24gPSB0cnVlO1xufSk7XG5cbmN1YmUucHJvcCgnX3Bvc2l0aW9uJywgbmV3IEZpcmUuVmVjMigwLCAwKSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuY3ViZS5wcm9wKCdfcGxheScsIGZhbHNlLCBGaXJlLkhpZGVJbkluc3BlY3Rvcik7XG5cbmN1YmUuZ2V0c2V0KCdwbGF5JyxcbmZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl9wbGF5O1xufSxcbmZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9PSB0aGlzLl9wbGF5KSB7XG4gICAgICAgIHRoaXMuX3BsYXkgPSB2YWx1ZTtcbiAgICB9XG4gICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIHRoaXMucGxheUFuaW1hdGlvbigpO1xuICAgIH1cbn0pO1xuXG5jdWJlLmdldHNldCgncG9zaXRpb24nLFxuZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3Bvc2l0aW9uO1xufSxcbmZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICE9IHRoaXMuX3Bvc2l0aW9uKSB7XG4gICAgICAgIHRoaXMuX3Bvc2l0aW9uID0gdmFsdWU7XG4gICAgfVxufSk7XG5cbmN1YmUucHJvdG90eXBlLmNsZWFyID0gZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5lbnRpdHkuZGlzcGF0Y2hFdmVudChuZXcgRmlyZS5FdmVudChcImN1cmIgY2xlYXJcIiwgdHJ1ZSkpO1xuICAgIHRoaXMuZW50aXR5LmRlc3Ryb3koKTtcbn07XG5cbmN1YmUucHJvdG90eXBlLnBsYXlBbmltYXRpb24gPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnN0b3BBbmltYXRpb24gPSBmYWxzZTtcbn07XG5cbmN1YmUucHJvdG90eXBlLmFuaW1hdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuZW50aXR5LnRyYW5zZm9ybS5zY2FsZSA9IG5ldyBGaXJlLlZlYzIodGhpcy5lbnRpdHkudHJhbnNmb3JtLnNjYWxlLnggLSBGaXJlLlRpbWUuZGVsdGFUaW1lICogNSwgdGhpcy5lbnRpdHkudHJhbnNmb3JtLnNjYWxlLnggLSBGaXJlLlRpbWUuZGVsdGFUaW1lICogNSk7XG4gICAgaWYgKHRoaXMuZW50aXR5LnRyYW5zZm9ybS5zY2FsZS54IC0gRmlyZS5UaW1lLmRlbHRhVGltZSA8PSAwKSB7XG4gICAgICAgIHRoaXMuc3RvcEFuaW1hdGlvbiA9IHRydWU7XG4gICAgICAgIHRoaXMuY2xlYXIoKTtcbiAgICB9XG59O1xuXG5jdWJlLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMuc3RvcEFuaW1hdGlvbikge1xuICAgICAgICB0aGlzLmFuaW1hdGlvbigpO1xuICAgIH1cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gY3ViZTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2goJzY2MzRmMTQ2ZjQ1YTQ3OTFhM2FiODY0ZTI5NDk3YTg5JywgJ0dhbWVNZW51Jyk7XG4vLyBzY3JpcHQvR2FtZS9HYW1lTWVudS5qc1xuXG52YXIgR2FtZU1lbnUgPSBGaXJlLmRlZmluZUNvbXBvbmVudChmdW5jdGlvbigpIHtcbn0pO1xuXG5HYW1lTWVudS5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuXG4gICAgdGhpcy5ob21lVVVJRCA9IFwiZTQxYmJkZTAtY2VlOC00NzVmLWI5NmMtMTY5ZGI0ZjZkNjlkXCI7XG4gICAgdGhpcy5nYW1lVVVJRCA9IFwiZTk1ODMxMmItMDNlMy00YTAzLWEyZmUtNmU3ZjQwZjYzNGQ2XCI7XG4gICAgdGhpcy5tZW51ID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnUnKTtcblxuICAgIHZhciBidG5fTWVudSA9IEZpcmUuRW50aXR5LmZpbmQoXCIvQnV0dG9uL2J0bl9NZW51XCIpO1xuICAgIGJ0bl9NZW51Lm9uKFwibW91c2V1cFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubWVudS5hY3RpdmUgPSB0cnVlO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB2YXIgYnRuX0NvbnRpbnVlID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnUvYnRuX0NvbnRpbnVlJyk7XG4gICAgYnRuX0NvbnRpbnVlLm9uKFwibW91c2V1cFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMubWVudS5hY3RpdmUgPSBmYWxzZVxuICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB2YXIgYnRuX1Jlc3RhcnQgPSBGaXJlLkVudGl0eS5maW5kKCcvTWVudS9idG5fUmVzdGFydCcpO1xuICAgIGJ0bl9SZXN0YXJ0Lm9uKFwibW91c2V1cFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSh0aGlzLmdhbWVVVUlEKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdmFyIGJ0bl9Ib21lID0gRmlyZS5FbnRpdHkuZmluZCgnL01lbnUvYnRuX0hvbWUnKTtcbiAgICBidG5fSG9tZS5vbihcIm1vdXNldXBcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICBGaXJlLkVuZ2luZS5sb2FkU2NlbmUodGhpcy5ob21lVVVJRCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIHZhciBnYW1lT3ZlclJlc3RhcnQgPSBGaXJlLkVudGl0eS5maW5kKFwiL0dhbWVPdmVyL2J0bl9SZXN0YXJ0XCIpO1xuICAgIGdhbWVPdmVyUmVzdGFydC5vbignbW91c2V1cCcsZnVuY3Rpb24gKCkge1xuICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSh0aGlzLmdhbWVVVUlEKTtcbiAgICB9LmJpbmQodGhpcykpO1xuICAgIFxuICAgIHZhciBnYW1lT3ZlckhvbWUgPSBGaXJlLkVudGl0eS5maW5kKFwiL0dhbWVPdmVyL2J0bl9Ib21lXCIpO1xuICAgIGdhbWVPdmVySG9tZS5vbignbW91c2V1cCcsZnVuY3Rpb24gKCkge1xuICAgICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSh0aGlzLmhvbWVVVUlEKTtcbiAgICB9LmJpbmQodGhpcykpO1xufTtcblxuRmlyZS5fUkZwb3AoKTsiLCJGaXJlLl9SRnB1c2goJ2ZmNDI5ODJmYWQ0MjQwMzM4MGNlMzhjNzVjZjIzNmY4JywgJ0dhbWUnKTtcbi8vIHNjcmlwdC9HYW1lL0dhbWUuanNcblxudmFyIEJvYXJkID0gcmVxdWlyZSgnQm9hcmQnKTtcbnZhciBDZWxsID0gcmVxdWlyZSgnQ2VsbCcpO1xudmFyIEN1YmUgPSByZXF1aXJlKCdDdWJlJyk7XG52YXIgQ3ViZUdyb3VwID0gcmVxdWlyZSgnQ3ViZUdyb3VwJyk7XG52YXIgQXVkaW9Db250cm9sID0gcmVxdWlyZSgnQXVkaW9Db250cm9sJyk7XG5cbnZhciBHYW1lID0gRmlyZS5kZWZpbmVDb21wb25lbnQoZnVuY3Rpb24oKSB7XG4gICAgdGhpcy5ib2FyZCA9IG51bGw7XG4gICAgdGhpcy5jdWJlR3JvdXAgPSBudWxsO1xuICAgIHRoaXMuY3ViZUdyb3VwTGlzdCA9IFtdO1xuICAgIHRoaXMuZnJhY3Rpb24gPSAwOy8vLS3lvZPliY3liIbmlbBcblx0XG4gICAgdGhpcy5pZGxlQ2VsbExpc3QgPSBbXTsvLy0tIOWcuuS4iuepuumXsueahOagvO+/vVxuXHRcbiAgICB0aGlzLnNjb3JlVGV4dCA9IG51bGw7XG4gICAgdGhpcy5fc2NvcmVWYWx1ZSA9IG51bGw7XG4gICAgXG4gICAgLy8g5YiG5pWw5LiK5rao5Yqo55S7XG4gICAgdGhpcy5pc0p1bXAgPSBmYWxzZTtcbiAgICB0aGlzLmp1bXBGaXJzdCA9IHRydWU7XG4gICAgXG4gICAgR2FtZS5pbnN0YW5jZSA9IHRoaXM7XG59KTtcblxuR2FtZS5pbnN0YW5jZSA9IG51bGw7XG5cbkdhbWUucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIC8vLS0g5Yib5bu65qC85a2Q5Yiw5qOL55uY5LiKXG4gICAgaWYgKCF0aGlzLnRlbXBDdWJlKSB7XG4gICAgICAgIHRoaXMudGVtcEN1YmUgPSBGaXJlLkVudGl0eS5maW5kKCcvUHJlZmFicy9jdWJlJyk7XG4gICAgfVxuXHQgICAgXG4gICAgdGhpcy5zY29yZVRleHQgPSBGaXJlLkVudGl0eS5maW5kKCcvR2FtZU92ZXIvc2NvcmUnKTtcbiAgICB2YXIgYm9hcmRPYmogPSBGaXJlLkVudGl0eS5maW5kKCcvQm9hcmQnKTtcbiAgICB0aGlzLmJvYXJkID0gYm9hcmRPYmouZ2V0Q29tcG9uZW50KEJvYXJkKTtcbiAgICB0aGlzLmJvYXJkLmNyZWF0ZSgpO1xuICAgIFxuICAgIHZhciBjdWJlR3JvdXBPYmogPSBGaXJlLkVudGl0eS5maW5kKCcvQ3ViZUdyb3VwJyk7XG4gICAgdGhpcy5jdWJlR3JvdXAgPSBjdWJlR3JvdXBPYmouZ2V0Q29tcG9uZW50KEN1YmVHcm91cCk7XG4gICAgaWYgKHRoaXMuY3ViZUdyb3VwTGlzdC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgdGhpcy5jdWJlR3JvdXBMaXN0ID0gdGhpcy5jdWJlR3JvdXAuY3JlYXRlMygzMik7XG4gICAgfVxuXG4gICAgdmFyIHNvY2VPYmogPSBGaXJlLkVudGl0eS5maW5kKFwiL1Njb3JlL3ZhbHVlXCIpO1xuICAgIHRoaXMuX3Njb3JlVmFsdWUgPSBzb2NlT2JqLmdldENvbXBvbmVudChGaXJlLkJpdG1hcFRleHQpO1xuXG59O1xuXG5HYW1lLnByb3RvdHlwZS51cGRhdGUgPSBmdW5jdGlvbigpIHtcblx0aWYgKHRoaXMuaXNKdW1wKSB7XG4gICAgICAgIHRoaXMuanVtcEFuaW1hdGlvbigpO1xuICAgIH1cbn07XG5cbi8vLS0g77+95pa55Z2X57uE5pS+5Yiw5qOL55uY77+9XG5HYW1lLnByb3RvdHlwZS5wdXRCb2FyZCA9IGZ1bmN0aW9uKGN1YmVHcm91cCkge1xuICAgIGlmICghY3ViZUdyb3VwICYmICFjdWJlR3JvdXAuX2NoaWxkcmVuKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHcybCA9IHRoaXMuYm9hcmQudHJhbnNmb3JtLmdldFdvcmxkVG9Mb2NhbE1hdHJpeCgpO1xuICAgIHZhciBwb3MgPSB3MmwudHJhbnNmb3JtUG9pbnQoY3ViZUdyb3VwLnRyYW5zZm9ybS53b3JsZFBvc2l0aW9uKTtcblxuICAgIHZhciB4ID0gTWF0aC5yb3VuZChwb3MueCAvICh0aGlzLmJvYXJkLnNpemUueCArIHRoaXMuYm9hcmQuc3BhY2luZyAvIDIpKTtcbiAgICB2YXIgeSA9IE1hdGgucm91bmQocG9zLnkgLyAodGhpcy5ib2FyZC5zaXplLnkgKyB0aGlzLmJvYXJkLnNwYWNpbmcgLyAyKSk7XG4gICAgdmFyIGNlbnRlciA9IG5ldyBWZWMyKHgsIHkpO1xuICAgIHZhciBoYXNQdXRDdWJlID0gdGhpcy5ib2FyZC5jYW5QdXRDdWJlVG9DZWxsKGN1YmVHcm91cCwgY2VudGVyKTtcblxuICAgIHZhciBjdXJiQ291bnQgPSBjdWJlR3JvdXAuX2NoaWxkcmVuLmxlbmd0aDtcbiAgICBpZiAoaGFzUHV0Q3ViZSkge1xuICAgICAgICB2YXIgaSA9IDAsXG4gICAgICAgIGxlbiA9IDAsXG4gICAgICAgIGNoaWxkID0gW107XG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IGN1YmVHcm91cC5fY2hpbGRyZW4ubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgIGNoaWxkLnB1c2goY3ViZUdyb3VwLl9jaGlsZHJlbltpXSk7XG4gICAgICAgIH1cbiAgICAgICAgZm9yIChpID0gMCwgbGVuID0gY2hpbGQubGVuZ3RoOyBpIDwgbGVuOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBjdWJlID0gY2hpbGRbaV0uZ2V0Q29tcG9uZW50KEN1YmUpO1xuICAgICAgICAgICAgdmFyIHBvcyA9IGN1YmUucG9zaXRpb247XG4gICAgICAgICAgICB2YXIgY2VsbCA9IHRoaXMuYm9hcmQuZ2V0Q2VsbChjZW50ZXIueCArIHBvcy54LCBjZW50ZXIueSArIHBvcy55KTtcbiAgICAgICAgICAgIGNlbGwucHV0Q3ViZShjdWJlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAoaSA9IDAsIGxlbiA9IHRoaXMuY3ViZUdyb3VwTGlzdC5sZW5ndGg7IGkgPCBsZW47ICsraSkge1xuICAgICAgICAgICAgdmFyIGdyb3VwID0gdGhpcy5jdWJlR3JvdXBMaXN0W2ldO1xuICAgICAgICAgICAgaWYgKGdyb3VwLmlkID09PSBjdWJlR3JvdXAuaWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmN1YmVHcm91cExpc3Quc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8tLSDmt7vliqDliIbmlbBcbiAgICAgICAgdGhpcy5hZGRGcmFjdGlvbihjdXJiQ291bnQpO1xuICAgICAgICBjdWJlR3JvdXAuZGVzdHJveSgpO1xuXG4gICAgICAgIC8vLS0g5riF6Zmk5ruh5qC8XG4gICAgICAgIHRoaXMucmVtb3ZlTGluZSgpO1xuXG4gICAgICAgIC8vLS0g5pu05paw5qOL55uY5LiK55qE56m65qC8XG4gICAgICAgIHRoaXMudXBkYXRlSWRsZUNlbGxMaXN0KCk7XG5cbiAgICAgICAgLy8tLSDliJvlu7rmlrDnmoRDdWJlIEdyb3VwXG4gICAgICAgIGlmICh0aGlzLmN1YmVHcm91cExpc3QubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLmN1YmVHcm91cExpc3QgPSB0aGlzLmN1YmVHcm91cC5jcmVhdGUzKDMyKTtcbiAgICAgICAgfVxuICAgICAgICAvLy0tIOWIpOaWrXBhc3PmiJbogIXlpLHotKVcbiAgICAgICAgdmFyIHBhc3MgPSB0aGlzLnBhc3MoKTtcbiAgICAgICAgaWYgKCFwYXNzKSB7XG4gICAgICAgICAgICB0aGlzLmdhbWVPdmVyKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGhhc1B1dEN1YmU7XG59O1xuXG5HYW1lLnByb3RvdHlwZS5yZW1vdmVMaW5lID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKHRoaXMuYm9hcmQuZGVsQ3ViZVJvd0xpc3QubGVuZ3RoID4gMCB8fCB0aGlzLmJvYXJkLmRlbEN1YmVDb2xMaXN0Lmxlbmd0aCA+IDApIHtcbiAgICAgICAgQXVkaW9Db250cm9sLnBsYXlfZmluaXNoZWQoKTtcbiAgICB9XG4gICAgXG4gICAgdmFyIGkgPSAwLFxuICAgIGogPSAwLFxuICAgIGRlbEN1YmVMaXN0ID0gbnVsbDtcbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5ib2FyZC5kZWxDdWJlUm93TGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWxDdWJlTGlzdCA9IHRoaXMuYm9hcmQuZGVsQ3ViZVJvd0xpc3RbaV07XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBkZWxDdWJlTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZGVsQ3ViZUxpc3Rbal0ucmVhZHlDbGVhciA9IHRydWU7XG4gICAgICAgICAgICBkZWxDdWJlTGlzdFtqXS5jdWJlLnBsYXlBbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKGkgPSAwOyBpIDwgdGhpcy5ib2FyZC5kZWxDdWJlQ29sTGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICBkZWxDdWJlTGlzdCA9IHRoaXMuYm9hcmQuZGVsQ3ViZUNvbExpc3RbaV07XG4gICAgICAgIGZvciAoaiA9IDA7IGogPCBkZWxDdWJlTGlzdC5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZGVsQ3ViZUxpc3Rbal0ucmVhZHlDbGVhciA9IHRydWU7XG4gICAgICAgICAgICBkZWxDdWJlTGlzdFtqXS5jdWJlLnBsYXlBbmltYXRpb24oKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMuYm9hcmQuZGVsQ3ViZVJvd0xpc3QgPSBbXTtcbiAgICB0aGlzLmJvYXJkLmRlbEN1YmVDb2xMaXN0ID0gW107XG4gICAgdGhpcy5fc2NvcmVWYWx1ZS50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKDAuNSwwLjUpO1xuICAgIHRoaXMuaXNKdW1wID0gdHJ1ZTtcbn07XG5cbi8vLS0g5re75Yqg5YiG5pWwXG5HYW1lLnByb3RvdHlwZS5hZGRGcmFjdGlvbiA9IGZ1bmN0aW9uIChjdXJiQ291bnQpIHtcbiAgICB2YXIgY3VyRnJhY3Rpb24gPSB0aGlzLmZyYWN0aW9uO1xuICAgIFxuICAgIHZhciBsaW5lTnVtID0gdGhpcy5ib2FyZC5kZWxDdWJlUm93TGlzdC5sZW5ndGg7XG4gICAgdmFyIHJvd051bSA9IGxpbmVOdW0gKiB0aGlzLmJvYXJkLmNvdW50Lng7XG4gICAgaWYgKGxpbmVOdW0gPiAxKSB7XG4gICAgICAgIHJvd051bSA9ICgxICsgKGxpbmVOdW0gLSAxKSAqIDAuNSkgKiAodGhpcy5ib2FyZC5jb3VudC54ICogbGluZU51bSk7XG4gICAgfVxuICAgIFxuICAgIGxpbmVOdW0gPSAgdGhpcy5ib2FyZC5kZWxDdWJlQ29sTGlzdC5sZW5ndGg7XG4gICAgdmFyIGNvbE51bSA9IGxpbmVOdW0gKiB0aGlzLmJvYXJkLmNvdW50Lng7XG4gICAgaWYgKGxpbmVOdW0gPiAxKSB7XG4gICAgICAgIGNvbE51bSA9ICgxICsgKGxpbmVOdW0gLSAxKSAqIDAuNSkgKiAodGhpcy5ib2FyZC5jb3VudC55ICogbGluZU51bSk7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZnJhY3Rpb24gPSAoY3VyRnJhY3Rpb24gKyBjdXJiQ291bnQpICsgcm93TnVtICsgY29sTnVtO1xuXG4gICAgdGhpcy5fc2NvcmVWYWx1ZS50ZXh0ID0gdGhpcy5mcmFjdGlvbjtcbn07XG5cbkdhbWUucHJvdG90eXBlLnVwZGF0ZUlkbGVDZWxsTGlzdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmlkbGVDZWxsTGlzdCA9IFtdO1xuICAgIGZvciAodmFyIHggPSAwOyB4IDwgdGhpcy5ib2FyZC5jb3VudC54OyArK3gpIHtcbiAgICAgICAgZm9yICh2YXIgeSA9IDA7IHkgPCB0aGlzLmJvYXJkLmNvdW50Lng7ICsreSkge1xuICAgICAgICAgICAgdmFyIGNlbGwgPSB0aGlzLmJvYXJkLmdldENlbGwoeCwgeSk7XG4gICAgICAgICAgICBpZiAoIWNlbGwuaGFzQ3ViZSB8fCAoY2VsbC5jdWJlICYmIGNlbGwucmVhZHlDbGVhcikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmlkbGVDZWxsTGlzdC5wdXNoKGNlbGwpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufTtcblxuR2FtZS5wcm90b3R5cGUuanVtcEFuaW1hdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5qdW1wRmlyc3QpIHtcbiAgICAgICAgdGhpcy5fc2NvcmVWYWx1ZS50cmFuc2Zvcm0uc2NhbGVYICs9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiAxMDtcbiAgICAgICAgdGhpcy5fc2NvcmVWYWx1ZS50cmFuc2Zvcm0uc2NhbGVZICs9IEZpcmUuVGltZS5kZWx0YVRpbWUgKiAxMDtcbiAgICAgICAgaWYgKHRoaXMuX3Njb3JlVmFsdWUudHJhbnNmb3JtLnNjYWxlWCA+PSAxLjUpIHtcbiAgICAgICAgICAgIHRoaXMuanVtcEZpcnN0ID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9ZWxzZSB7XG4gICAgICAgIHRoaXMuX3Njb3JlVmFsdWUudHJhbnNmb3JtLnNjYWxlWCAtPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogMTA7XG4gICAgICAgIHRoaXMuX3Njb3JlVmFsdWUudHJhbnNmb3JtLnNjYWxlWSAtPSBGaXJlLlRpbWUuZGVsdGFUaW1lICogMTA7XG4gICAgICAgIGlmICh0aGlzLl9zY29yZVZhbHVlLnRyYW5zZm9ybS5zY2FsZVggPD0gMSkge1xuICAgICAgICAgICAgdGhpcy5fc2NvcmVWYWx1ZS50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKDEsMSk7XG4gICAgICAgICAgICB0aGlzLmlzSnVtcCA9IGZhbHNlO1xuICAgICAgICAgICAgdGhpcy5qdW1wRmlyc3QgPSB0cnVlO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5HYW1lLnByb3RvdHlwZS5wYXNzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBncm91cExpc3QgPSB0aGlzLmN1YmVHcm91cExpc3Q7XG4gICAgdmFyIGlkbGVDZWxsTGlzdCA9IHRoaXMuaWRsZUNlbGxMaXN0O1xuICAgIHZhciBncm91cGxlbiA9IGdyb3VwTGlzdC5sZW5ndGg7XG4gICAgdmFyIGNlbGxsZW4gPSBpZGxlQ2VsbExpc3QubGVuZ3RoO1xuICAgIHZhciBjYW5QdXQgPSBmYWxzZTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGdyb3VwbGVuOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBjZWxsbGVuOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBjZW50ZXIgPSBuZXcgRmlyZS5WZWMyKGlkbGVDZWxsTGlzdFtqXS5vZmZzZXQueCwgaWRsZUNlbGxMaXN0W2pdLm9mZnNldC55KTtcbiAgICAgICAgICAgIHZhciBjYW5QdXQgPSB0aGlzLmJvYXJkLmNhblB1dEN1YmVUb0NlbGwoZ3JvdXBMaXN0W2ldLCBjZW50ZXIpO1xuICAgICAgICAgICAgaWYgKGNhblB1dCkge1xuICAgICAgICAgICAgICAgIGJyZWFrXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNhblB1dCkge1xuICAgICAgICAgICAgYnJlYWtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gY2FuUHV0O1xufTtcblxuR2FtZS5wcm90b3R5cGUuZ2FtZU92ZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHNjb3JlQml0bWFwVGV4dCA9IHRoaXMuc2NvcmVUZXh0LmdldENvbXBvbmVudChGaXJlLkJpdG1hcFRleHQpXG4gICAgc2NvcmVCaXRtYXBUZXh0LnRleHQgPSB0aGlzLmZyYWN0aW9uO1xuICAgIHZhciBnYW1lT3ZlckJvYXJkID0gRmlyZS5FbnRpdHkuZmluZCgnL0dhbWVPdmVyJyk7XG4gICAgZ2FtZU92ZXJCb2FyZC50cmFuc2Zvcm0uc2NhbGUgPSBuZXcgRmlyZS5WZWMyKDEsMSk7XG4gICAgdGhpcy5pc1Njb3JlID0gdHJ1ZTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gR2FtZTtcblxuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaCgnNDk2MTM3ODZkZjMzNDRlYTk4ZWRlNDZhNWFmNjk3ODYnLCAnTWFpbk1lbnUnKTtcbi8vIHNjcmlwdC9NZW51L01haW5NZW51LmpzXG5cbnZhciBNYWluTWVudSA9IEZpcmUuZGVmaW5lQ29tcG9uZW50KGZ1bmN0aW9uKCl7XG4gICAgXG59KTtcblxuLy9NYWluTWVudS5wcm9wKCcnKVxuXG5NYWluTWVudS5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24oKXtcblxuICAgIHRoaXMuZ2FtZVVVSUQgPSBcImU5NTgzMTJiLTAzZTMtNGEwMy1hMmZlLTZlN2Y0MGY2MzRkNlwiO1xuICAgIFxuXHR2YXIgYnRuUGxheSA9IEZpcmUuRW50aXR5LmZpbmQoXCIvYnRuX3BsYXlcIik7XG5cdGJ0blBsYXkub24oXCJtb3VzZXVwXCIsIGZ1bmN0aW9uICgpIHtcblx0ICAgIEZpcmUuRW5naW5lLmxvYWRTY2VuZSh0aGlzLmdhbWVVVUlEKTtcblx0fS5iaW5kKHRoaXMpKTtcbiAgICBcbn07XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKCdlMGFjMmI4MTBhNzM0NjZkOWYzMDVkNDAxY2EyMzIzNCcsICdUb2dnbGUnKTtcbi8vIHNjcmlwdC9VSS9Ub2dnbGUuanNcblxudmFyIFRvZ2dsZSA9IEZpcmUuZGVmaW5lQ29tcG9uZW50KGZ1bmN0aW9uICgpIHsgXG5cdHRoaXMuX2J0blJlbmRlciA9IG51bGw7XG4gICAgdGhpcy5fdGlnZ2xlID0gZmFsc2U7XG59KTtcblxuVG9nZ2xlLnByb3AoJ25vcm1hbCcsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLlNwcml0ZSkpO1xuXG5Ub2dnbGUucHJvcCgncHJlc3NlZCcsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLlNwcml0ZSkpO1xuXG5Ub2dnbGUucHJvdG90eXBlLm9uTG9hZCA9IGZ1bmN0aW9uICgpIHtcblxuICAgIHRoaXMuX2J0blJlbmRlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcbiAgICBcbiAgICB0aGlzLl9idG5SZW5kZXIuc3ByaXRlID0gdGhpcy5ub3JtYWw7XG4gICAgXG4gICAgdGhpcy5lbnRpdHkub24oJ21vdXNlZG93bicsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fdGlnZ2xlID0gIXRoaXMuX3RpZ2dsZTtcbiAgICAgICAgaWYodGhpcy5fdGlnZ2xlKSB7XG5cdCAgICAgICAgdGhpcy5fYnRuUmVuZGVyLnNwcml0ZSA9IHRoaXMucHJlc3NlZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNle1xuXHQgICAgICAgIHRoaXMuX2J0blJlbmRlci5zcHJpdGUgPSB0aGlzLm5vcm1hbDtcbiAgICAgICAgfVxuICAgIH0uYmluZCh0aGlzKSk7XG59O1xuXG5GaXJlLl9SRnBvcCgpOyJdfQ==
