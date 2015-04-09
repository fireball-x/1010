var MainMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 属性
    properties: {
        // 开始按钮
        btn_play: {
            default: null,
            type: Fire.Entity
        }
    },
    // 载入Game场景事件
    goToGameScene:function () {
        // 切换到Game场景
        Fire.Engine.loadScene("Game");
    },
    // 载入时
    onLoad: function () {
        // 绑定按钮事件
        console.log(this.btn_play);
        this.btn_play.on("mouseup", this.goToGameScene);
    },
    // 销毁时
    onDestroy: function () {
        // 注销按钮事件
        this.btn_play.off("mouseup", this.goToGameScene);
    }
});
