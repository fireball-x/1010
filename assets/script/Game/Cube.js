var cube = Fire.Class({
    // 继承
    extends: Fire.Component,

    // 构造函数
    constructor: function() {
        this.stopAnimation = true;
        this._position = new Fire.Vec2(0,0);
        this._destroy = false;
    },

    // 属性
    properties: {
        //
        destroy : {
            get: function () {
                return this._destroy;
            },
            set: function (value) {
                if (value !== this._destroy) {
                    this._destroy = value;
                }
                if (value) {
                    this.playAnimation();
                }
            }
        },
        // 单个cube的相对坐标
        position: {
            get: function () {
                return this._position;
            },
            set: function (value) {
                if (value != this._position) {
                    this._position = value;
                }
            }
        }
    },
    clear: function() {
        this.entity.dispatchEvent(new Fire.Event("curb clear", true));
        this.entity.destroy();
    },
    playAnimation: function() {
        this.stopAnimation = false;
    },
    // 单个cube的消失动画
    animation: function() {
        this.entity.transform.scale = new Fire.Vec2(this.entity.transform.scale.x - Fire.Time.deltaTime * 5, this.entity.transform.scale.x - Fire.Time.deltaTime * 5);
        if (this.entity.transform.scale.x - Fire.Time.deltaTime <= 0) {
            this.stopAnimation = true;
            this.clear();
        }
    },
    update: function() {
        if (!this.stopAnimation) {
            this.animation();
        }
    }
});
