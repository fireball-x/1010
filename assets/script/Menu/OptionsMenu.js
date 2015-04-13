var OptionsMenu = Fire.Class({
    // 继承
    extends    : Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnRender = null;
        this._open = false;
        // 定义获取输入事件的回调方法，保存到变量以便之后反注册
        this.bindedShoundPressEvent = this.onSoundPressEvent.bind(this);
        this.bindedHomePressEvent = this.onHomePressEvent.bind(this);
        this.bindedRestartPressEvent = this.onRestartPressEvent.bind(this);
        this.bindedPlayPressEvent = this.onPlayPressEvent.bind(this);

    },
    // 属性
    properties: {
        // 音效开关按钮(Open and Close)的X轴偏移坐标
        soundButtonOffsetXPos: new Fire.Vec2(-60, 60),
        btn_home: {
            default: null,
            type: Fire.Entity
        },
        btn_restart: {
            default: null,
            type: Fire.Entity
        },
        btn_play: {
            default: null,
            type: Fire.Entity
        },
        btn_sound: {
            default: null,
            type: Fire.Entity
        },
        audio_bg: {
            default: null,
            type: Fire.AudioSource
        },
        audio_bobo: {
            default: null,
            type: Fire.AudioSource
        },
        audio_done: {
            default: null,
            type: Fire.AudioSource
        }
    },
    // 按下声音按钮事件
    onSoundPressEvent: function (event) {
        this._open = !this._open;
        if (this._open) {
            this.btn_sound.transform.position = this.soundButtonOffsetXPos.x;
        }
        else {
            this.btn_sound.transform.position = this.soundButtonOffsetXPos.y;
        }
        this.audio_bg.mute = this._open;
        this.audio_bobo.mute = this._open;
        this.audio_done.mute = this._open;
    },
    // 按下Home按钮事件
    onHomePressEvent: function (event) {
        Fire.Engine.loadScene('MainMenu');
    },
    // 按下重新开始按钮事件
    onRestartPressEvent: function (event) {
        Fire.Engine.loadScene('Game');
    },
    // 按下返回按钮事件
    onPlayPressEvent: function (event) {
        this.entity.active = false;
    },
    // 开始时
    start: function () {
        this.btn_sound.on('mouseup', this.bindedShoundPressEvent);
        this.btn_home.on('mouseup', this.bindedHomePressEvent);
        this.btn_restart.on('mouseup', this.bindedRestartPressEvent);
        this.btn_play.on('mouseup', this.bindedPlayPressEvent);
    },
    // 销毁时
    onDestroy: function () {
        this.btn_sound.off('mouseup', this.bindedShoundPressEvent);
        this.btn_home.off('mouseup', this.bindedHomePressEvent);
        this.btn_restart.off('mouseup', this.bindedRestartPressEvent);
        this.btn_play.off('mouseup', this.bindedPlayPressEvent);
    }
});
