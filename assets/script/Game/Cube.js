var Cube = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function() {
        this._playAnimation = false;
    },
    // 清除
    Clear: function () {
        this._playAnimation = true;
    },
    // 更新
    update: function() {
        if (this._playAnimation) {
            // 消失动画
            this.entity.transform.scaleX -= Fire.Time.deltaTime * 5
            this.entity.transform.scaleY -= Fire.Time.deltaTime * 5;
            if (this.entity.transform.scaleX <= 0 || this.entity.transform.scaleY <= 0) {
                // 发送消息给父节点通知即将被清除
                this.entity.dispatchEvent(new Fire.Event("curb clear", true));
                // 删除自身
                this.entity.destroy();
                this._playAnimation = false;
            }
        }
    }
});
