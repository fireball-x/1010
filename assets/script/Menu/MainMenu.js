var MainMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 定义获取输入事件的回调方法，保存到变量以便之后反注册
        this.bindedGotoGameSceneEvent = this.goToGameSceneEvent.bind(this);
    },
    // 属性
    properties: {
        // 开始按钮
        btn_play: {
            default: null,
            type: Fire.Entity
        }
    },
    // 载入Game场景事件
    goToGameSceneEvent: function (event) {
        // 切换到Game场景
        Fire.Engine.loadScene("Game");
    },
    // 载入时
    start: function () {
        // 绑定按钮事件
        this.btn_play.on("mouseup", this.bindedGotoGameSceneEvent);
    },
    // 销毁时
    onDestroy: function () {
        // 注销按钮事件
        this.btn_play.off("mouseup", this.bindedGotoGameSceneEvent);
    }
});
