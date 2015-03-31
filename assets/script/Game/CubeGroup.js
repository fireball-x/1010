var Cube = require('Cube');
var AudioControl = require('AudioControl');

var thisTransform = null;
var thisGroup = null;
var camera = null;

var Box_9 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": 0, "x": 1},
    {"y": -1, "x": 0},
    {"y": -1, "x": 1},
    {"y": -1, "x": -1},
    {"y": 1, "x": -1},
    {"y": 1, "x": 0},
    {"y": 1, "x": 1},
];
// 田 *3
var Curved_3_0 = [
    {"y": 1, "x": 0},
    {"y": 0, "x": 0},
    {"y": 0, "x": 1},
];
//L *3  0
var Curved_3_90 = [
    {"y": 0, "x": 0},
    {"y": -1, "x": 0},
    {"y": 0, "x": 1},
];
//L *3 90
var Curved_3_180 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": -1, "x": 0},
];
//L *3 180
var Curved_3_270 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": 1, "x": 0},
];
//L *3 270
var Curved_5_0 = [
    {"y": 0, "x": 0},
    {"y": 1, "x": 0},
    {"y": 2, "x": 0},
    {"y": 0, "x": 1},
    {"y": 0, "x": 2},
];
//L *5 0
var Curved_5_90 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": 1},
    {"y": 0, "x": 2},
    {"y": -1, "x": 0},
    {"y": -2, "x": 0},
];
//L *5 0 90
var Curved_5_180 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": 0, "x": -2},
    {"y": -1, "x": 0},
    {"y": -2, "x": 0},
];
//L *5 0 180
var Curved_5_270 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": 0, "x": -2},
    {"y": 2, "x": 0},
    {"y": 1, "x": 0},
];
//L *5 0 270
var Box_4 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": 1},
    {"y": 1, "x": 0},
    {"y": 1, "x": 1},
];

var Box_1 = [
    {"y": 0, "x": 0},
];

var Line_2_0 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": 1},
];
// -- *2 0
var Line_2_90 = [
    {"y": 0, "x": 0},
    {"y": 1, "x": 0},
];
// I *2 90
var Line_3_0 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": 0, "x": 1},
];
// --- *3 0
var Line_3_90 = [
    {"y": 0, "x": 0},
    {"y": 1, "x": 0},
    {"y": -1, "x": 0},
];
// --- *3 90
var Line_4_0 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": 0, "x": 1},
    {"y": 0, "x": 2},
];
// *4 0
var Line_4_90 = [
    {"y": 0, "x": 0},
    {"y": -1, "x": 0},
    {"y": 1, "x": 0},
    {"y": 2, "x": 0},
];
// *4 90
var Line_5_0 = [
    {"y": 0, "x": 0},
    {"y": 0, "x": -1},
    {"y": 0, "x": 1},
    {"y": 0, "x": 2},
    {"y": 0, "x": -2},
];
//
var Line_5_90 = [
    {"y": 0, "x": 0},
    {"y": -1, "x": 0},
    {"y": -2, "x": 0},
    {"y": 1, "x": 0},
    {"y": 2, "x": 0},
];

var GridType = Fire.defineEnum({
    Box_9       : -1,
    Box_4       : -1,
    Box_1       : -1,
    Curved_3_0  : -1,
    Curved_3_90 : -1,
    Curved_3_180: -1,
    Curved_3_270: -1,
    Curved_5_0  : -1,
    Curved_5_90 : -1,
    Curved_5_180: -1,
    Curved_5_270: -1,
    Line_2_0    : -1,
    Line_2_90   : -1,
    Line_3_0    : -1,
    Line_3_90   : -1,
    Line_4_0    : -1,
    Line_4_90   : -1,
    Line_5_0    : -1,
    Line_5_90   : -1
});

///color
var blue = new Fire.Color(97 / 255, 190 / 255, 227 / 255, 1);
var yellow = new Fire.Color(253 / 255, 197 / 255, 76 / 255, 1);
var red = new Fire.Color(218 / 255, 192 / 255, 90 / 255, 1);
var lightblue = new Fire.Color(1 / 255, 158 / 255, 95 / 255, 1);
var pink = new Fire.Color(229 / 255, 107 / 255, 129 / 255, 1);
var orange = new Fire.Color(243 / 255, 80 / 255, 12 / 255, 1);
var green = new Fire.Color(85 / 255, 192 / 255, 67 / 255, 1);

var startX = 0;
var startY = 0;
var isMouseUp = true;

var moveGrid = null;
var moveYcount = 0;

var groupBorad = [];
var groupBoradPositions = [];

var CubeGroup = Fire.Class({
    // 继承
    extends    : Fire.Component,

    // 构造函数
    constructor: function () {
        this.stopAnimation = true;
        this._creatCubes = false;
        this._creatThree = false;
        this._gridType = [
            Box_9, Box_4, Box_1,
            Curved_3_0, Curved_3_90, Curved_3_180,
            Curved_3_270, Curved_5_0, Curved_5_90,
            Curved_5_180, Curved_5_270, Line_2_0,
            Line_2_90, Line_3_0, Line_3_90,
            Line_4_0, Line_4_90, Line_5_0, Line_5_90
        ];
        this._select = GridType.Box_9;

        this.gridType = {
            "Box_9"       : Box_9,
            "Box_4"       : Box_4,
            "Box_1"       : Box_1,
            "Curved_3_0"  : Curved_3_0,
            "Curved_3_90" : Curved_3_90,
            "Curved_3_180": Curved_3_180,
            "Curved_3_270": Curved_3_270,
            "Curved_5_0"  : Curved_5_0,
            "Curved_5_90" : Curved_5_90,
            "Curved_5_180": Curved_5_180,
            "Curved_5_270": Curved_5_270,
            "Line_2_0"    : Line_2_0,
            "Line_2_90"   : Line_2_90,
            "Line_3_0"    : Line_3_0,
            "Line_3_90"   : Line_3_90,
            "Line_4_0"    : Line_4_0,
            "Line_4_90"   : Line_4_90,
            "Line_5_0"    : Line_5_0,
            "Line_5_90"   : Line_5_90
        };
        this._Colors = [blue, yellow, red, lightblue, pink, orange, green];
        this.Colors = {
            "blue"     : blue,
            "yellow"   : yellow,
            "red"      : red,
            "lightblue": lightblue,
            "pink"     : pink,
            "orange"   : orange,
            "green"    : green,
        };
    },

    // 属性
    properties : {
        //
        CreatThree: {
            get: function () {
                return this._creatThree;
            },
            set: function (value) {
                if (value != this._creatThree) {
                    this._creatThree = value;
                }
                if (value) {
                    this.create3(32);
                }
            }
        },
        //
        CreatCubes: {
            get: function () {
                return this._creatCubes;
            },
            set: function (value) {
                if (value !== this._creatCubes) {
                    this._creatCubes = value;
                    if (value) {
                        var obj = this.createRandom(32);
                    } else {
                        this.clear();
                    }
                }
            }
        },
        //
        select: {
            get: function () {
                return this._select;
            },
            set: function (value) {
                if (value != this._select) {
                    this._select = value;
                }
            }
        }
    },
    /// ***********************
    /// * size: 单个cube大小
    /// * gridType: 指定的cubeGroup
    /// * callback:
    /// * _color: [可选] 设置指定color. 如果不设置，则随机
    /// ***********************
    create: function(size, gridType, _color) {
        var color = this._Colors[Math.floor(Math.random() * 7)];
        if (!!_color) {
            color = _color;
        }
        var grid = this.entity.find('../Prefabs/cube');
        var gridGroup = new Fire.Entity('group');

        var touchGrid = Fire.instantiate(grid);
        touchGrid.parent = gridGroup;
        touchGrid.name = 'touchGrid';
        touchGrid.transform.scale = new Fire.Vec2(5, 5);
        touchGrid.getComponent(Fire.SpriteRenderer).color = new Fire.Color(0, 0, 0, 0);

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

        gridGroup.transform.scale = new Fire.Vec2(0.6, 0.6);

        gridGroup.on('mousedown',
            function (event) {

                var yCount = 0;

                for (var i = 0; i < gridType.length; i++) {
                    if (gridType[i].y < 0) {
                        if (gridType[i].y < yCount) {
                            yCount = -gridType[i].y;
                        }
                    }
                }

                isMouseUp = false;
                moveGrid = gridGroup;
                moveYcount = yCount;
                moveGrid.transform.scale = new Fire.Vec2(0.9, 0.9);
                if (Fire.Input.hasTouch) {
                    moveGrid.transform.position = new Fire.Vec2(moveGrid.transform.position.x, moveGrid.transform.position.y + (yCount + 1) * 30 * 0.9);
                }

            }.bind(this)
        );

        gridGroup.on('mouseup',
            function (event) {
                moveGrid = null;
            }.bind(this)
        );

        thisGroup = gridGroup;
        return gridGroup;
    },
    // 生成单个随机cubegroup
    createRandom: function(size) {
        var ran = 0;
        ran = Math.floor(Math.random() * 19);
        var ranGrid = this._gridType[ran];
        return this.create(size, ranGrid);
    },
    // cubegroup的move操作
    move: function (moveX, moveY, grid, moveYcount) {
        var CubeGroupPosition = thisTransform;
        var screenPosition = new Fire.Vec2(moveX, moveY);
        var wordPostion = camera.screenToWorld(screenPosition);
        if (Fire.Input.hasTouch) {
            grid.transform.position = new Fire.Vec2(wordPostion.x + CubeGroupPosition.x, wordPostion.y - CubeGroupPosition.y + (moveYcount + 1) * 30 * 0.9);
        }
        else {
            grid.transform.position = new Fire.Vec2(wordPostion.x + CubeGroupPosition.x, wordPostion.y - CubeGroupPosition.y);
        }
    },
    // 生成3个随机cubegroup并排列到指定位置
    create3: function(size) {
        groupBoradPositions = [];
        groupBorad = [];

        for (var i = 0; i < 3; i++) {
            var group = this.createRandom(size);
            group.transform.position = new Fire.Vec2((( -5 * size * 0.8) + (5 * size * 0.8) * i), group.transform.position.y);
            group.transform.scale = new Fire.Vec2(0.6, 0.6);
            var xy = {"id": group.id, 'position': group.transform.position};
            groupBoradPositions.push(xy);
            groupBorad.push(group);
        }

        this.entity.transform.scale = new Fire.Vec2(0.0, 0.0);
        this.play();

        return groupBorad;
    },
    // 清除cubegroup
    clear: function() {
        try {
            thisGroup.destroy();
        } catch (e) {

        }
    },
    // 如果move过程中不允许put on,则复原cubegroup的原始位置
    resetPosition: function(group) {
        var undoPosition = group.transform.position;
        for (var i = 0; i < groupBorad.length; i++) {
            if (groupBorad[i].id === group.id) {
                for (var j = 0; j < groupBoradPositions.length; j++) {
                    if (groupBoradPositions[j].id === group.id) {
                        group.transform.position = groupBoradPositions[j].position;
                        group.transform.scale = new Fire.Vec2(0.6, 0.6);
                    }
                }
            }
        }
    },
    //
    onLoad: function() {
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
    },
    //
    play: function(){
        this.stopAnimation = false;
    },
    // cubegroup的出现动画
    animation: function(){
        this.entity.transform.scale = new Fire.Vec2(this.entity.transform.scale.x + Fire.Time.deltaTime * 2, this.entity.transform.scale.x + Fire.Time.deltaTime * 2);
        if (this.entity.transform.scale.x + Fire.Time.deltaTime >= 1) {
            this.entity.transform.scale = new Fire.Vec2(1, 1);
            this.stopAnimation = true;
        }
    },
    //
    update:function() {
        if (!this.stopAnimation) {
            this.animation();
        }
    }
});
