var Cell = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function() {
        this.cube = null;
        this.readyClear = false;
    },
    // 属性
    properties: {
        offset: new Fire.Vec2(0, 0),
        hasCube: false
    },
    //
    putCube: function (cube) {
        cube.entity.parent = this.entity;
        cube.transform.position = new Fire.Vec2(0, 0);
        this.hasCube = true;
        this.cube = cube;
        // 绑定已经放置方块消息
        this.entity.dispatchEvent(new Fire.Event("putCube", true));
        // 绑定Cube销毁消息
        this.entity.on("curb clear", function () {
            this.hasCube = false;
            this.readyClear = false;
            this.cube = null;
        }.bind(this));
    },
    //
    removeCube: function() {
        this.readyClear = true;
        var cube = this.cube.entity.getComponent('Cube')
        cube.Clear();
    }
});
