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
    if (value != this._select) {
        this._select = value;
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
var lightblue = new Fire.Color(1 / 255, 158 / 255, 95 / 255, 1);
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
var moveYcount = 0;

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
    
    var touchGrid = Fire.instantiate(grid);
    touchGrid.parent = gridGroup;
    touchGrid.name = 'touchGrid';
    touchGrid.transform.scale = new Fire.Vec2(5,5);
    touchGrid.getComponent(Fire.SpriteRenderer).color = new Fire.Color(0,0,0,0);

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
    
    var yCount = 0;

    for (var i =0; i < gridType.length; i ++) {
        if (gridType[i].y < 0) {
            if (gridType[i].y < yCount) {
                yCount = -gridType[i].y;
            }
        }
    }
    
    gridGroup.transform.scale = new Fire.Vec2(0.6,0.6);

    gridGroup.on('mousedown',
        function(event) {
        	isMouseUp = false;
            moveGrid = gridGroup;
            moveYcount = yCount;
        	moveGrid.transform.scale = new Fire.Vec2(0.9,0.9);
        	moveGrid.transform.position = new Fire.Vec2(moveGrid.transform.position.x,moveGrid.transform.position.y + (yCount + 1) * 30 * 0.9);
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

// 生成单个随机cubegroup
CubeGroup.prototype.createRandom = function(size) {
    var ran = 0;
    ran = Math.floor(Math.random() * 19);
    var ranGrid = this._gridType[ran];
    return this.create(size, ranGrid);
};

// cubegroup的move操作
CubeGroup.prototype.move = function (moveX,moveY,grid,moveYcount) {
    var CubeGroupPosition = thisTransform;
    var screenPosition = new Fire.Vec2(moveX,moveY);
    var wordPostion = camera.screenToWorld(screenPosition);
    grid.transform.position = new Fire.Vec2(wordPostion.x + CubeGroupPosition.x,wordPostion.y - CubeGroupPosition.y + (moveYcount +1) * 30 * 0.9);
};

var groupBorad = [];
var groupBoradPositions = [];

// 生成3个随机cubegroup并排列到指定位置
CubeGroup.prototype.create3 = function(size) {
    groupBoradPositions = [];

    groupBorad = [];
    for (var i = 0; i < 3; i++) {
        var group = this.createRandom(size);
        group.transform.position = new Fire.Vec2((( - 5 * size * 0.8) + (5 * size * 0.8) * i), group.transform.position.y);
        group.transform.scale = new Fire.Vec2(0.6,0.6);
        var xy = {"id":group.id,'position':group.transform.position};
        groupBoradPositions.push(xy);
        groupBorad.push(group);
    }

    this.entity.transform.scale = new Fire.Vec2(0.0, 0.0);
	var timer = setTimeout(function (){
        this.play();
    }.bind(this),100);

    return groupBorad;
};

// 清除cubegroup
CubeGroup.prototype.clear = function() {
    try {
        thisGroup.destroy();
    } catch(e) {

	}
};


// 如果move过程中不允许put on,则复原cubegroup的原始位置
CubeGroup.prototype.resetPosition = function(group) {
    var undoPosition = group.transform.position;
	for(var i =0; i < groupBorad.length; i++ ) {
		if (groupBorad[i].id === group.id) {
            for (var j = 0; j < groupBoradPositions.length; j++) {
                if (groupBoradPositions[j].id === group.id) {
                    group.transform.position = groupBoradPositions[j].position;
                    group.transform.scale = new Fire.Vec2(0.6,0.6);
                }
            }
        }
    }
};

CubeGroup.prototype.onLoad = function () {

    var Game = require('Game');

    Fire.Input.on('mousedown', function (event) {
        startX = event.screenX;
        startY = event.screenY;
    }.bind(this));

    Fire.Input.on('mousemove', function (event) {
        if (!isMouseUp) {
            this.move(event.screenX, event.screenY, moveGrid, moveYcount);
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
};


CubeGroup.prototype.play = function () {
  	  this.stopAnimation = false;
};

// cubegroup的出现动画
CubeGroup.prototype.animation = function () {
  this.entity.transform.scale = new Fire.Vec2(this.entity.transform.scale.x + Fire.Time.deltaTime * 2, this.entity.transform.scale.x + Fire.Time.deltaTime * 2);
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
