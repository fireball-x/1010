var GameMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {},
    // 属性
    properties: {
        btn_options: {
            default: null,
            type: Fire.Entity
        },
        opentinsMenu:{
            default: null,
            type: Fire.Entity
        }
    },
    // 按下设置按钮事件
    onOptionsPressEvent: function () {
        this.opentinsMenu.active = true;
    },
    // 开始时
    onStart: function () {
        this.btn_options.on('mouseup', this.onOptionsPressEvent.bind(this));
    },
    // 销毁时
    onDestroy: function () {
        this.btn_options.off('mouseup', this.onOptionsPressEvent.bind(this));
    }
});
