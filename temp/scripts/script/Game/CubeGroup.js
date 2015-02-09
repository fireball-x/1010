Fire._RFpush('a50520d1c1374357987172078b1c7588', 'CubeGroup');
// script\Game\CubeGroup.js

var CubeGroup = Fire.defineComponent();

var Cube = require('Cube');

CubeGroup.prop("_creatCubes",false,Fire.HideInInspector);

CubeGroup.getset("CreatCubes",
    function () {
        return this._creatCubes;
    },

    function (value) {
        if (value !== this._creatCubes) {
            this._creatCubes = value;
            if (value) {
                this.createRandom(32,function(obj) {
                    // NOTE: 创建cubegroup成功后,返回一个obj,可调用obj.setColor来改变已经创建好的cubeGroup
					obj.setColor(this.Colors.blue);
                    console.log(obj.color);
                }.bind(this));
//                 this.create(32,this.gridType.Box_9,function (obj) {
//                     console.log(obj);
//                 }.bind(this),this.Colors.pink);
            }
        }
    }
);

var Box_9 = [
    {"y":0,"x":0},
    {"y":0,"x":-1},
    {"y":0,"x":1},
    {"y":-1,"x":-1},
    {"y":-1,"x":0},
    {"y":-1,"x":1},
    {"y":-1,"x":-1},
    {"y":1,"x":-1},
    {"y":1,"x":0},
    {"y":1,"x":1},
]; // 田 *3

var Curved_3_0 = [
    {"y":0,"x":-1},
    {"y":-1,"x":-1},
    {"y":-1,"x":0},
]; //L *3  0

var Curved_3_90 = [
    {"y":1,"x":-1},
    {"y":0,"x":-1},
    {"y":1,"x":0},
]; //L *3 90

var Curved_3_180 = [
    {"y":1,"x":1},
    {"y":1,"x":0},
    {"y":0,"x":1},
]; //L *3 180

var Curved_3_270 = [
    {"y":-1,"x":1},
    {"y":-1,"x":0},
    {"y":0,"x":1},
]; //L *3 270

var Curved_5_0 = [
  	{"y":-1,"x":-1},
    {"y":-1,"x":0},
    {"y":-1,"x":1},
    {"y":0,"x":-1},
    {"y":1,"x":-1},
]; //L *5 0

var Curved_5_90 = [
  	{"y":-1,"x":-1},
    {"y":0,"x":-1},
    {"y":1,"x":-1},
    {"y":1,"x":1},
    {"y":1,"x":0},
]; //L *5 0 90

var Curved_5_180 = [
  	{"y":1,"x":-1},
    {"y":1,"x":0},
    {"y":1,"x":1},
    {"y":0,"x":1},
    {"y":-1,"x":1},
]; //L *5 0 180

var Curved_5_270 = [
    {"y":1,"x":1},
    {"y":0,"x":1},
    {"y":-1,"x":1},
    {"y":-1,"x":0},
    {"y":-1,"x":-1},
]; //L *5 0 270



var Box_4 = [
    {"y":0,"x":0},
    {"y":0,"x":1},
    {"y":1,"x":0},
    {"y":1,"x":1},
];

var Box_1 = [
    {"y":0,"x":0},
];

var Line_2_0 = [
    {"y":0,"x":0},
    {"y":0,"x":1},
];  // -- *2 0

var Line_2_90 = [
    {"y":0,"x":0},
    {"y":1,"x":0},
]; // I *2 90


var Line_3_0 = [
    {"y":0,"x":0},
    {"y":0,"x":-1},
    {"y":0,"x":1},
]; // --- *3 0

var Line_3_90 = [
    {"y":0,"x":0},
    {"y":1,"x":0},
    {"y":-1,"x":0},
]; // --- *3 90

var Line_4_0 = [
    {"y":0,"x":0},
    {"y":0,"x":-1},
    {"y":0,"x":1},
    {"y":0,"x":2},
]; // ---- *4 0

var Line_4_90 = [
    {"y":0,"x":0},
    {"y":-1,"x":0},
    {"y":1,"x":0},
    {"y":2,"x":0},
]; //---- *4 90

var Line_5_0 = [
    {"y":0,"x":0},
    {"y":0,"x":-1},
    {"y":0,"x":1},
    {"y":0,"x":2},
    {"y":0,"x":-2},
];

var Line_5_90 = [
    {"y":0,"x":0},
    {"y":-1,"x":0},
    {"y":-2,"x":0},
    {"y":1,"x":0},
    {"y":2,"x":0},
];

CubeGroup.prototype._gridType = [
     Box_9,
     Box_4,
     Box_1,
     Curved_3_0,
     Curved_3_90,
     Curved_3_180,
     Curved_3_270,
     Curved_5_0,
     Curved_5_90,
     Curved_5_180,
     Curved_5_270,
     Line_2_0,
     Line_2_90,
     Line_3_0,
     Line_3_90,
     Line_4_0,
     Line_4_90,
     Line_5_0,
     Line_5_90
];

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

var blue = new Fire.Color(97/255,190/255,227/255,1);
var orange = new Fire.Color(253/255,197/255,76/255,1);
var red = new Fire.Color(218/255,192/255,90/255,1);
var lightblue = new Fire.Color(83/255,211/255,174/255,1);
var pink = new Fire.Color(229/255,107/255,129/255,1);


CubeGroup.prototype._Colors = [blue,orange,red,lightblue,pink];

CubeGroup.prototype.Colors = {
    "blue": blue,
	"orange": orange,
    "red": red,
    "lightblue": lightblue,
    "pink": pink
};

/// ***********************
/// * size: 单个cube大小
/// * gridType: 指定的cubeGroup
/// * callback:
/// * _color: [可选] 设置指定color. 如果不设置，则随机
/// ***********************
CubeGroup.prototype.create = function (size,gridType,callback,_color) {
   	var color = this._Colors[Math.floor(Math.random()*5)];
    if (!!_color) {
        color = _color;
    }

    var grid = this.entity.find('../Prefabs/Cube');
    var gridGroup = new Fire.Entity('group');
    gridGroup.parent = this.entity;

    for (var i = 0; i < gridType.length; i++) {
         var obj = Fire.instantiate(grid);
         obj.parent = gridGroup;
         obj.name = 'child_' + i;
         obj.addComponent(Cube);
         obj.getComponent(Fire.SpriteRenderer).color = color;
         obj.transform.position = new Vec2(gridType[i].x * size , gridType[i].y * size);
         console.log(obj);
    }

    gridGroup.setColor = function (color) {
      	for (var j = 0; j < gridGroup._children.length; j++) {
            gridGroup._children[j].getComponent(Fire.SpriteRenderer).color = color;
        }
    };

    gridGroup.color = color;

    callback(gridGroup);
};


CubeGroup.prototype.createRandom = function (size,callback) {
    var ranGrid = this._gridType[Math.floor(Math.random()*19)];
    this.create(size,ranGrid,callback);
};

CubeGroup.prototype.clear = function () {
  	this.entity.destroy();
};

CubeGroup.prototype.update = function () {

};

CubeGroup.prototype.onLoad = function () {

};

Fire._RFpop();