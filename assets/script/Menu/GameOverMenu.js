var GameOverMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {},
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
    onHomePressEvent: function () {
        Fire.Engine.loadScene('MainMenu');
    },
    // 按下重新开始按钮事件
    onRestartPressEvent: function () {
        Fire.Engine.loadScene('Game');
    },
    // 开始时
    onStart: function () {
        this.btn_home.on('mouseup', this.onHomePressEvent.bind(this));
        this.btn_restart.on('mouseup', this.onRestartPressEvent.bind(this));
    },
    onEnable: function () {
        var Game = require('Game');
        this.score.text = Game.instance.fraction;
    },
    // 销毁时
    onDestroy: function () {
        this.btn_home.off('mouseup', this.onHomePressEvent.bind(this));
        this.btn_restart.off('mouseup', this.onRestartPressEvent.bind(this));
    }
});
