var OptionsMenu = Fire.Class({
    // 继承
    extends    : Fire.Component,
    // 构造函数
    constructor: function () {
        this._btnRender = null;
        this._open = false;
        this.soundOpenPos = new Fire.Vec2(-60, 10);
        this.soundClosePos = new Fire.Vec2(60, 10);
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
    onSoundPressEvent: function () {
        this._open = !this._open;
        if (this._open) {
            this.btn_sound.transform.position = this.soundOpenPos;
        }
        else {
            this.btn_sound.transform.position = this.soundClosePos;
        }
        this.audio_bg.mute = this._open;
        this.audio_bobo.mute = this._open;
        this.audio_done.mute = this._open;
    },
    // 按下Home按钮事件
    onHomePressEvent: function () {
        Fire.Engine.loadScene('MainMenu');
    },
    // 按下重新开始按钮事件
    onRestartPressEvent: function () {
        Fire.Engine.loadScene('Game');
    },
    // 按下返回按钮事件
    onPlayPressEvent: function () {
        this.entity.active = false;
    },
    // 开始时
    onStart: function () {
        this.btn_sound.on('mouseup', this.onSoundPressEvent.bind(this));
        this.btn_home.on('mouseup', this.onHomePressEvent.bind(this));
        this.btn_restart.on('mouseup', this.onRestartPressEvent.bind(this));
        this.btn_play.on('mouseup', this.onPlayPressEvent.bind(this));
    },
    // 销毁时
    onDestroy: function () {
        this.btn_sound.off('mouseup', this.onSoundPressEvent.bind(this));
        this.btn_home.off('mouseup', this.onHomePressEvent.bind(this));
        this.btn_restart.off('mouseup', this.onRestartPressEvent.bind(this));
        this.btn_play.off('mouseup', this.onPlayPressEvent.bind(this));
    }
});
