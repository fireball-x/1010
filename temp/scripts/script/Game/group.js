Fire._RFpush('5c9c02a2736a456d9fb17830036c97c1', 'group');
// script\Game\group.js

var group = Fire.defineComponent();

var cubeList = [];

group.prototype.setCubeList = function (obj) {
    cubeList.push(obj);
};

group.prototype.cubeListInit = function () {
    cubeList = [];
};


group.prototype.getCubeList = function () {
    return cubeList;
};

module.exports = group;

Fire._RFpop();