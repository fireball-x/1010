var CubeGroup = Fire.defineComponent();

var Cube = require('Cube');

// var groupManager = require('group');

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
    "x": -1
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
    "y": 0,
    "x": -1
},
{
    "y": -1,
    "x": -1
},
{
    "y": -1,
    "x": 0
},
]; //L *3  0
var Curved_3_90 = [{
    "y": 1,
    "x": -1
},
{
    "y": 0,
    "x": -1
},
{
    "y": 1,
    "x": 0
},
]; //L *3 90
var Curved_3_180 = [{
    "y": 1,
    "x": 1
},
{
    "y": 1,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
]; //L *3 180
var Curved_3_270 = [{
    "y": -1,
    "x": 1
},
{
    "y": -1,
    "x": 0
},
{
    "y": 0,
    "x": 1
},
]; //L *3 270
var Curved_5_0 = [{
    "y": -1,
    "x": -1
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
    "y": 0,
    "x": -1
},
{
    "y": 1,
    "x": -1
},
]; //L *5 0
var Curved_5_90 = [{
    "y": -1,
    "x": -1
},
{
    "y": 0,
    "x": -1
},
{
    "y": 1,
    "x": -1
},
{
    "y": 1,
    "x": 1
},
{
    "y": 1,
    "x": 0
},
]; //L *5 0 90
var Curved_5_180 = [{
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
{
    "y": 0,
    "x": 1
},
{
    "y": -1,
    "x": 1
},
]; //L *5 0 180
var Curved_5_270 = [{
    "y": 1,
    "x": 1
},
{
    "y": 0,
    "x": 1
},
{
    "y": -1,
    "x": 1
},
{
    "y": -1,
    "x": 0
},
{
    "y": -1,
    "x": -1
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
    if (thisGroup.isValid) {
        this.clear();
    }
    if (value != this._select) {
        this._select = value;
        this.create(32, this._gridType[value]);
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
var orange = new Fire.Color(253 / 255, 197 / 255, 76 / 255, 1);
var red = new Fire.Color(218 / 255, 192 / 255, 90 / 255, 1);
var lightblue = new Fire.Color(83 / 255, 211 / 255, 174 / 255, 1);
var pink = new Fire.Color(229 / 255, 107 / 255, 129 / 255, 1);

CubeGroup.prototype._Colors = [blue, orange, red, lightblue, pink];

CubeGroup.prototype.Colors = {
    "blue": blue,
    "orange": orange,
    "red": red,
    "lightblue": lightblue,
    "pink": pink
};


var startX = 0;
var startY = 0;
var isMouseUp = true;

var startOffsetX = 0;
var startOffsetY = 0;

var moveGrid = null;
/// ***********************
/// * size: 单个cube大小
/// * gridType: 指定的cubeGroup
/// * callback:
/// * _color: [可选] 设置指定color. 如果不设置，则随机
/// ***********************
CubeGroup.prototype.create = function(size, gridType, _color) {

    var color = this._Colors[Math.floor(Math.random() * 5)];
    if ( !! _color) {
        color = _color;
    }

    var grid = this.entity.find('../Prefabs/Cube');
    var gridGroup = new Fire.Entity('group');
    gridGroup.parent = this.entity;
//     var groupMgr = gridGroup.addComponent(groupManager);
//     groupMgr.cubeListInit();

    for (var i = 0; i < gridType.length; i++) {
        var obj = Fire.instantiate(grid);
        obj.parent = gridGroup;
        obj.name = 'child_' + i;
        var cube = obj.addComponent(Cube);

        cube.position = new Fire.Vec2(gridType[i].x, gridType[i].y);
        obj.getComponent(Fire.SpriteRenderer).color = color;

        obj.transform.position = new Vec2(gridType[i].x * size, gridType[i].y * size);
//         groupMgr.setCubeList(cube);
    }

    gridGroup.on('mousedown',
        function(event) {
        	isMouseUp = false;
            startOffsetX = gridGroup.transform.position.x;
            startOffsetY = gridGroup.transform.position.y;
            moveGrid = gridGroup;
        }.bind(this)
	);

    thisGroup = gridGroup;
    return gridGroup;
};

CubeGroup.prototype.createRandom = function(size) {
    var ranGrid = this._gridType[Math.floor(Math.random() * 19)];
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
    //if (groupBorad.length > 0) {
    //    for (var j = 0; j < groupBorad.length; j++) {
    //        groupBorad[j].entity.destroy();
    //        //Fire.FObject._deferredDestroy();
    //        Fire.log('destroy');
    //    }
    //}
    groupBorad = [];
    for (var i = 0; i < 3; i++) {
        var group = this.createRandom(size);
        group.transform.position = new Fire.Vec2((( - 5 * size) + (5 * size) * i), group.transform.position.y);
        var xy = {"id":group.id,'position':group.transform.position};
        groupBoradPositions.push(xy);
        groupBorad.push(group);
    }
    return groupBorad;
};

CubeGroup.prototype.clear = function() {
    try {
        thisGroup.destroy();
        //Fire.FObject._deferredDestroy();
    } catch(e) {

	}
};

CubeGroup.prototype.resetPosition = function(group) {
	for(var i =0; i<groupBorad.length; i++ ) {
		if (groupBorad[i].id === group.id) {
            group.transform.position = groupBoradPositions[i].position;
        }
    }
};

CubeGroup.prototype.onLoad = function() {
    // TODO
	
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

            var canPut = Game.instance.putBoard(moveGrid);
            if (!canPut) {
                this.resetPosition(moveGrid);
            }

        }.bind(this));

        camera = Fire.Entity.find("/Main Camera").getComponent(Fire.Camera);
        thisTransform = Fire.Entity.find("/CubeGroup").transform.position;
    }
};

var thisTransform = null;

CubeGroup.prototype.onStart = function() {

};

module.exports = CubeGroup;
