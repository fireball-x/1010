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
