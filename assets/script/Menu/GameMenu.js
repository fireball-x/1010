var GameMenu = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        // 定义获取输入事件的回调方法，保存到变量以便之后反注册
        this.bindedOptionsPressEvent = this.onOptionsPressEvent.bind(this);
    },
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
    onOptionsPressEvent: function (event) {
        this.opentinsMenu.active = true;
    },
    // 开始时
    start: function () {
        this.btn_options.on('mouseup', this.bindedOptionsPressEvent);
    },
    // 销毁时
    onDestroy: function () {
        this.btn_options.off('mouseup', this.bindedOptionsPressEvent);
    }
});
