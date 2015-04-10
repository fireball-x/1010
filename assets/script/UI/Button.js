var Button =Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnRender = null;
        // 定义获取输入事件的回调方法，保存到变量以便之后反注册
        this.bindedPressDownEvent = this.onPressDown.bind(this);
        this.bindedPressUpEvent = this.onPressUp.bind(this);
    },
    // 属性
    properties: {
        normal: {
            default: null,
            type: Fire.Sprite
        },
        hover: {
            default: null,
            type: Fire.Sprite
        },
        pressed: {
            default: null,
            type: Fire.Sprite
        },
        disabled: {
            default: null,
            type: Fire.Sprite
        }
    },
    // 按下
    onPressDown: function () {
        this._btnRender.sprite = this.pressed;
    },
    onPressUp: function () {
        this._btnRender.sprite = this.normal;
    },
    // 载入时
    onLoad: function () {
        this._btnRender = this.entity.getComponent(Fire.SpriteRenderer);
        this._btnRender.sprite = this.normal;
        this.entity.on('mousedown', this.bindedPressDownEvent);
        this.entity.on('mouseup', this.bindedPressUpEvent);
    },
    // 销毁时
    onDestroy: function () {
        this.entity.off('mousedown', this.bindedPressDownEvent);
        this.entity.off('mouseup', this.bindedPressUpEvent);
    }
});
