var random = Fire.defineComponent();


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


var grids = [Box_9,
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


var blue = new Fire.Color(97/255,190/255,227/255,1);
var orange = new Fire.Color(253/255,197/255,76/255,1);
var red = new Fire.Color(218/255,192/255,90/255,1);
var lightblue = new Fire.Color(83/255,211/255,174/255,1);
var pink = new Fire.Color(229/255,107/255,129/255,1);

var colors = [blue,orange,red,lightblue,pink];



// var cubes = [
//     {"obj":null,"guid",""},
// ];

random.prototype.createRandom = function (size,callback) {
    var ranGrid = grids[Math.floor(Math.random()*9)];
	var ranColor = colors[Math.floor(Math.random()*5)];
    var rotation = 90 * Math.floor(Math.random() * 4);
    
    var grid = this.entity.find('grid');
    var gridGroup = new Fire.Entity('group');
    gridGroup.parent = this.entity;
    
    for (var i = 0; i < ranGrid.length; i++) {
         var obj = Fire.instantiate(grid);
         obj.parent = gridGroup;
         obj.name = 'child_' + i;
         obj.getComponent(Fire.SpriteRenderer).color = ranColor;
         obj.transform.position = new Vec2(ranGrid[i].x * size , ranGrid[i].y * size);
    }
    gridGroup.transform.rotation = rotation;
    gridGroup.setColor = function (color) {
      	for (var j = 0; j < gridGroup._children.length; j++) {
            gridGroup._children[j].getComponent(Fire.SpriteRenderer).color = color;
        }  
    };
    grid.active = false;
   
    callback(gridGroup);
};
 
var thisobj = null;

random.prototype.update = function () {
//     thisobj.setColor(red);
};

var CubeGroup = function () {  
};

CubeGroup.prototype.createRandom = function () {
    console.log(this);
  	this.createRandom(32);
};



random.prototype.onLoad = function () {
	this.createRandom(32,function(obj) {
       console.log(obj); 
       thisobj = obj;
    });
};
