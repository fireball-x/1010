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
var box9 = [
    [0,1,1,1,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
    [0,1,1,1,0],
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

// color
var blue = new Fire.Color(97 / 255, 190 / 255, 227 / 255, 1);
var yellow = new Fire.Color(253 / 255, 197 / 255, 76 / 255, 1);
var red = new Fire.Color(218 / 255, 192 / 255, 90 / 255, 1);
var lightblue = new Fire.Color(1 / 255, 158 / 255, 95 / 255, 1);
var pink = new Fire.Color(229 / 255, 107 / 255, 129 / 255, 1);
var orange = new Fire.Color(243 / 255, 80 / 255, 12 / 255, 1);
var green = new Fire.Color(85 / 255, 192 / 255, 67 / 255, 1);

var CubeGroup = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 随机格子类型
        this._randomGridTypes = [
            Box_9, Box_4, Box_1,
            Curved_3_0, Curved_3_90, Curved_3_180,
            Curved_3_270, Curved_5_0, Curved_5_90,
            Curved_5_180, Curved_5_270, Line_2_0,
            Line_2_90, Line_3_0, Line_3_90,
            Line_4_0, Line_4_90, Line_5_0, Line_5_90
        ];
        // 随机颜色
        this._randomColors = [blue, yellow, red, lightblue, pink, orange, green];
        // 保存当前随机出来gridType
        this._gridType = null;
    },
    // 属性
    properties: {
        // 创建出来时的坐标
        initPos: {
            default: new Fire.Vec2(0, 0),
            type: Fire.Vec2()
        },
        // 高度
        moveYcount: {
            get: function () {
                var yCount = 0;
                for (var i = 0; i < this._gridType.length; i++) {
                    if (this._gridType[i].y < 0) {
                        if (this._gridType[i].y < yCount) {
                            yCount = -this._gridType[i].y;
                        }
                    }
                }
                return yCount;
            }
        }
    },
    create: function (tempGrid, index, size) {
        var renderer = null;
        // 创建可以点击的范围格子
        var touchGrid = Fire.instantiate(tempGrid);
        touchGrid.parent = this.entity;
        touchGrid.name = 'touchGrid';
        touchGrid.transform.position = new Fire.Vec2(0, 0);
        touchGrid.transform.scale = new Fire.Vec2(5, 5);
        renderer = touchGrid.getComponent(Fire.SpriteRenderer);
        renderer.color = new Fire.Color(0, 0, 0, 0);
        renderer.customSize = new Fire.Vec2(size, size);
        // 随机各种类型
        var gridType = this._randomGridTypes[Math.floor(Math.random() * 19)];
        // 随机颜色
        var color = this._randomColors[Math.floor(Math.random() * 7)];
        // 创建Cube
        for (var i = 0; i < gridType.length; i++) {
            var entity = Fire.instantiate(tempGrid);
            entity.parent = this.entity;
            entity.name = 'child_' + i;
            var cube = entity.addComponent('Cube');
            cube.position = new Fire.Vec2(gridType[i].x, gridType[i].y);
            renderer = entity.getComponent(Fire.SpriteRenderer);
            renderer.color = color;
            renderer.customSize = new Fire.Vec2(size, size)
            entity.transform.position = new Vec2(gridType[i].x * size, gridType[i].y * size);
        }
        // 储存gridType
        this._gridType = gridType;
        // 设置坐标
        this.transform.x = ( -5 * size * 0.8) + (5 * size * 0.8) * index;
        this.transform.scale = new Fire.Vec2(0.6, 0.6);
        // 赋值初始坐标
        this.initPos = this.transform.position;
    },
    clear: function () {
        this.entity.destroy();
    },
    // 重置
    reset: function () {
        this.transform.position = this.initPos;
        this.transform.scale = new Fire.Vec2(0.6, 0.6);
    }
});
