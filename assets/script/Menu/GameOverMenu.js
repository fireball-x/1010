var GameOverMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 定义获取输入事件的回调方法，保存到变量以便之后反注册
        this.bindedHomePressEvent = this.onHomePressEvent.bind(this);
        this.bindedRestartPressEvent = this.onRestartPressEvent.bind(this);
    },
    // 属性
    properties: {
        btn_home: {
            default: null,
            type: Fire.Entity
        },
        btn_restart: {
            default: null,
            type: Fire.Entity
        },
        score: {
            default: null,
            type: Fire.BitmapText
        },
        hight_score: {
            default: null,
            type: Fire.BitmapText
        }
    },
    // 按下Home按钮事件
    onHomePressEvent: function (event) {
        Fire.Engine.loadScene('MainMenu');
    },
    // 按下重新开始按钮事件
    onRestartPressEvent: function (event) {
        Fire.Engine.loadScene('Game');
    },
    // 开始时
    start: function () {
        this.btn_home.on('mouseup', this.bindedHomePressEvent);
        this.btn_restart.on('mouseup', this.bindedRestartPressEvent);
    },
    onEnable: function () {
        var Game = require('Game');
        this.score.text = Game.instance.fraction;
    },
    // 销毁时
    onDestroy: function () {
        this.btn_home.off('mouseup', this.bindedHomePressEvent);
        this.btn_restart.off('mouseup', this.bindedRestartPressEvent);
    }
});
