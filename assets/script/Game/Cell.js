var Cell = Fire.Class({
    // 继承
    extends: Fire.Component,

    // 构造函数
    constructor: function() {
        this.cube = null;
        this.readyClear = null;
    },
    // 属性
    properties: {
        offset: {
            default: new Fire.Vec2(0, 0),
            type: Fire.Vec2
        },
        hasCube: false
    },
    //
    clean: function() {
        this.entity.destroy();
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
        var Cube = require('Cube');
        this.readyClear = true;
        this.cube.entity.getComponent(Cube).playAnimation();
    }
});
