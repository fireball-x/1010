require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"audio-clip":[function(require,module,exports){
Fire._RFpush('audio-clip');
// src/audio-clip.js

Fire.AudioClip = (function () {
    var AudioClip = Fire.extend("Fire.AudioClip", Fire.Asset);

    AudioClip.prop('rawData', null, Fire.RawType('audio'));

    AudioClip.get('buffer', function () {
        return Fire.AudioContext.getClipBuffer(this);
    });

    AudioClip.get("length", function () {
        return Fire.AudioContext.getClipLength(this);
    });

    AudioClip.get("samples", function () {
        return Fire.AudioContext.getClipSamples(this);
    });

    AudioClip.get("channels", function () {
        return Fire.AudioContext.getClipChannels(this);
    });

    AudioClip.get("frequency", function () {
        return Fire.AudioContext.getClipFrequency(this);
    });

    return AudioClip;
})();

// create entity action
// @if EDITOR
Fire.AudioClip.prototype.createEntity = function ( cb ) {
    var ent = new Fire.Entity(this.name);

    var audioSource = ent.addComponent(Fire.AudioSource);

    audioSource.clip = this;

    if ( cb )
        cb (ent);
};
// @endif

module.exports = Fire.AudioClip;

Fire._RFpop();
},{}],"audio-legacy":[function(require,module,exports){
Fire._RFpush('audio-legacy');
// src/audio-legacy.js

(function(){
    var UseWebAudio = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
    if (UseWebAudio) {
        return;
    }
    var AudioContext = {};

    function loader (url, callback, onProgress) {
        var audio = document.createElement("audio");
        audio.addEventListener("canplaythrough", function () {
            callback(null, audio);
        }, false);
        audio.addEventListener('error', function (e) {
            callback('LoadAudioClip: "' + url +
                    '" seems to be unreachable or the file is empty. InnerMessage: ' + e, null);
        }, false);

        audio.src = url;
        audio.load();
    }

    Fire.LoadManager.registerRawTypes('audio', loader);

    AudioContext.initSource = function (target) {
        target._audio = null;
    };

    AudioContext.getCurrentTime = function (target) {
        if (target && target._audio && target._playing) {
            return target._audio.currentTime;
        }
        else {
            return 0;
        }
    };

    AudioContext.updateTime = function (target, value) {
        if (target && target._audio) {
            var duration = target._audio.duration;
            target._audio.currentTime = value;
        }
    };

    // 靜音
    AudioContext.updateMute = function (target) {
        if (!target || !target._audio) { return; }
        target._audio.muted = target.mute;
    };

    // 设置音量，音量范围是[0, 1]
    AudioContext.updateVolume = function (target) {
        if (!target || !target._audio) { return; }
        target._audio.volume = target.volume;
    };

    // 设置循环
    AudioContext.updateLoop = function (target) {
        if (!target || !target._audio) { return; }
        target._audio.loop = target.loop;
    };

    // 将音乐源节点绑定具体的音频buffer
    AudioContext.updateAudioClip = function (target) {
        if (!target || !target.clip) { return; }
        target._audio = target.clip.rawData;
    };

    // 暫停
    AudioContext.pause = function (target) {
        if (!target._audio) { return; }
        target._audio.pause();
    };

    // 停止
    AudioContext.stop = function (target) {
        if (!target._audio) { return; }
        target._audio.pause();
        target._audio.currentTime = 0;
    };

    // 播放
    AudioContext.play = function (target) {
        if (!target || !target.clip || !target.clip.rawData) { return; }
        if (target._playing && !target._paused) { return; }
        this.updateAudioClip(target);
        this.updateVolume(target);
        this.updateLoop(target);
        this.updateMute(target);
        target._audio.play();

        // 播放结束后的回调
        target._audio.addEventListener('ended', function () {
            target.onPlayEnd.bind(target);
        }, false);
    };

    // 获得音频剪辑的 buffer
    AudioContext.getClipBuffer = function (clip) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };

    // 以秒为单位 获取音频剪辑的 长度
    AudioContext.getClipLength = function (clip) {
        return target.clip.rawData.duration;
    };

    // 音频剪辑的长度
    AudioContext.getClipSamples = function (target) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };

    // 音频剪辑的声道数
    AudioContext.getClipChannels = function (target) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };

    // 音频剪辑的采样频率
    AudioContext.getClipFrequency = function (target) {
        Fire.error("Audio does not contain the attribute!");
        return null;
    };


    Fire.AudioContext = AudioContext;
})();

Fire._RFpop();
},{}],"audio-source":[function(require,module,exports){
Fire._RFpush('audio-source');
// src/audio-source.js

var AudioSource = (function () {
    var AudioSource = Fire.extend("Fire.AudioSource", Fire.Component, function () {
        this._playing = false; //-- 声源暂停或者停止时候为false
        this._paused = false;//-- 来区分声源是暂停还是停止

        this._startTime = 0;
        this._lastPlay = 0;

        this._buffSource = null;
        this._volumeGain = null;

        this.onEnd = null;
    });

    //
    Fire.addComponentMenu(AudioSource, 'AudioSource');

    //
    Object.defineProperty(AudioSource.prototype, "isPlaying", {
        get: function () {
            return this._playing && !this._paused;
        }
    });

    Object.defineProperty(AudioSource.prototype, "isPaused", {
        get: function () {
            return this._paused;
        }
    });

    //
    Object.defineProperty(AudioSource.prototype, 'time', {
        get: function () {
            return Fire.AudioContext.getCurrentTime(this);
        },
        set: function (value) {
            Fire.AudioContext.updateTime(this, value);
        }
    });

    //
    AudioSource.prop('_playbackRate', 1.0, Fire.HideInInspector);
    AudioSource.getset('playbackRate',
        function () {
            return this._playbackRate;
        },
        function (value) {
            if (this._playbackRate !== value) {
                this._playbackRate = value;
                Fire.AudioContext.updatePlaybackRate(this);
            }
        }
    );

    //
    AudioSource.prop('_clip', null, Fire.HideInInspector);
    AudioSource.getset('clip',
        function () {
            return this._clip;
        },
        function (value) {
            if (this._clip !== value) {
                this._clip = value;
                Fire.AudioContext.updateAudioClip(this);
            }
        },
        Fire.ObjectType(Fire.AudioClip)
    );

    //
    AudioSource.prop('_loop', false, Fire.HideInInspector);
    AudioSource.getset('loop',
       function () {
           return this._loop;
       },
       function (value) {
           if (this._loop !== value) {
               this._loop = value;
               Fire.AudioContext.updateLoop(this);
           }
       }
    );

    //
    AudioSource.prop('_mute', false, Fire.HideInInspector);
    AudioSource.getset('mute',
       function () {
           return this._mute;
       },
       function (value) {
           if (this._mute !== value) {
               this._mute = value;
               Fire.AudioContext.updateMute(this);
           }
       }
    );

    //
    AudioSource.prop('_volume', 1, Fire.HideInInspector);
    AudioSource.getset('volume',
       function () {
           return this._volume;
       },
       function (value) {
           if (this._volume !== value) {
               this._volume = Math.clamp(value);
               Fire.AudioContext.updateVolume(this);
           }
       },
       Fire.Range(0,1)
    );

    AudioSource.prop('playOnAwake', true);

    AudioSource.prototype.onPlayEnd = function () {
        if ( this.onEnd ) {
            this.onEnd();
        }

        this._playing = false;
        this._paused = false;
    };

    AudioSource.prototype.pause = function () {
        if ( this._paused )
            return;

        Fire.AudioContext.pause(this);
        this._paused = true;
    };

    AudioSource.prototype.play = function () {
        if ( this._playing && !this._paused )
            return;

        if ( this._paused )
            Fire.AudioContext.play(this, this._startTime);
        else
            Fire.AudioContext.play(this, 0);

        this._playing = true;
        this._paused = false;
    };

    AudioSource.prototype.stop = function () {
        if ( !this._playing ) {
            return;
        }

        Fire.AudioContext.stop(this);
        this._playing = false;
        this._paused = false;
    };

    AudioSource.prototype.onLoad = function () {
        if (this._playing ) {
            this.stop();
        }
    };

    AudioSource.prototype.onStart = function () {
        //if (this.playOnAwake) {
        //    console.log("onStart");
        //    this.play();
        //}
    };

    AudioSource.prototype.onEnable = function () {
        if (this.playOnAwake) {
            this.play();
        }
    };

    AudioSource.prototype.onDisable = function () {
        this.stop();
    };

    return AudioSource;
})();

Fire.AudioSource = AudioSource;

Fire._RFpop();
},{}],"audio-web-audio":[function(require,module,exports){
Fire._RFpush('audio-web-audio');
// src/audio-web-audio.js

(function () {
    var NativeAudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext);
    if ( !NativeAudioContext ) {
        return;
    }

    // fix fireball-x/dev#365
    if (!Fire.nativeAC) {
        Fire.nativeAC = new NativeAudioContext();
    }

    // 添加safeDecodeAudioData的原因：https://github.com/fireball-x/dev/issues/318
    function safeDecodeAudioData(context, buffer, url, callback) {
        var timeout = false;
        var timerId = setTimeout(function () {
            callback('The operation of decoding audio data already timeout! Audio url: "' + url +
                     '". Set Fire.AudioContext.MaxDecodeTime to a larger value if this error often occur. ' +
                     'See fireball-x/dev#318 for details.', null);
        }, AudioContext.MaxDecodeTime);

        context.decodeAudioData(buffer,
            function (decodedData) {
                if (!timeout) {
                    callback(null, decodedData);
                    clearTimeout(timerId);
                }
            },
            function (e) {
                if (!timeout) {
                    callback(null, 'LoadAudioClip: "' + url +
                        '" seems to be unreachable or the file is empty. InnerMessage: ' + e);
                    clearTimeout(timerId);
                }
            }
        );
    }

    function loader(url, callback, onProgress) {
        var cb = callback && function (error, xhr) {
            if (xhr) {
                safeDecodeAudioData(Fire.nativeAC, xhr.response, url, callback);
            }
            else {
                callback('LoadAudioClip: "' + url +
               '" seems to be unreachable or the file is empty. InnerMessage: ' + error, null);
            }
        };
        Fire.LoadManager._loadFromXHR(url, cb, onProgress, 'arraybuffer');
    }

    Fire.LoadManager.registerRawTypes('audio', loader);

    var AudioContext = {};

    AudioContext.MaxDecodeTime = 3000;

    AudioContext.getCurrentTime = function (target) {
        if ( target._paused ) {
            return target._startTime;
        }

        if ( target._playing ) {
            return target._startTime + this.getPlayedTime(target);
        }

        return 0;
    };

    AudioContext.getPlayedTime = function (target) {
        return (Fire.nativeAC.currentTime - target._lastPlay) * target._playbackRate;
    };

    //
    AudioContext.updateTime = function (target, time) {
        target._lastPlay = Fire.nativeAC.currentTime;
        target._startTime = time;

        if ( target.isPlaying ) {
            this.pause(target);
            this.play(target);
        }
    };

    //
    AudioContext.updateMute = function (target) {
        if (!target._volumeGain) { return; }
        target._volumeGain.gain.value = target.mute ? -1 : (target.volume - 1);
    };

    // range [0,1]
    AudioContext.updateVolume = function (target) {
        if (!target._volumeGain) { return; }
        target._volumeGain.gain.value = target.volume - 1;
    };

    //
    AudioContext.updateLoop = function (target) {
        if (!target._buffSource) { return; }
        target._buffSource.loop = target.loop;
    };

    // bind buffer source
    AudioContext.updateAudioClip = function (target) {
        if ( target.isPlaying ) {
            this.stop(target,false);
            this.play(target);
        }
    };

    //
    AudioContext.updatePlaybackRate = function (target) {
        if ( !this.isPaused ) {
            this.pause(target);
            this.play(target);
        }
    };

    //
    AudioContext.pause = function (target) {
        if (!target._buffSource) { return; }

        target._startTime += this.getPlayedTime(target);
        target._buffSource.onended = null;
        target._buffSource.stop();
    };

    //
    AudioContext.stop = function ( target, ended ) {
        if (!target._buffSource) { return; }

        if ( !ended ) {
            target._buffSource.onended = null;
        }
        target._buffSource.stop();
    };

    //
    AudioContext.play = function ( target, at ) {
        if (!target.clip || !target.clip.rawData) { return; }

        // create buffer source
        var bufferSource = Fire.nativeAC.createBufferSource();

        // create volume control
        var gain = Fire.nativeAC.createGain();

        // connect
        bufferSource.connect(gain);
        gain.connect(Fire.nativeAC.destination);
        bufferSource.connect(Fire.nativeAC.destination);

        // init parameters
        bufferSource.buffer = target.clip.rawData;
        bufferSource.loop = target.loop;
        bufferSource.playbackRate.value = target.playbackRate;
        bufferSource.onended = target.onPlayEnd.bind(target);
        gain.gain.value = target.mute ? -1 : (target.volume - 1);

        //
        target._buffSource = bufferSource;
        target._volumeGain = gain;
        target._startTime = at || 0;
        target._lastPlay = Fire.nativeAC.currentTime;

        // play
        bufferSource.start( 0, this.getCurrentTime(target) );
    };

    // ===================

    //
    AudioContext.getClipBuffer = function (clip) {
        return clip.rawData;
    };

    //
    AudioContext.getClipLength = function (clip) {
        if (clip.rawData) {
            return clip.rawData.duration;
        }
        return -1;
    };

    //
    AudioContext.getClipSamples = function (clip) {
        if (clip.rawData) {
            return clip.rawData.length;
        }
        return -1;
    };

    //
    AudioContext.getClipChannels = function (clip) {
        if (clip.rawData) {
            return clip.rawData.numberOfChannels;
        }
        return -1;
    };

    //
    AudioContext.getClipFrequency = function (clip) {
        if (clip.rawData) {
            return clip.rawData.sampleRate;
        }
        return -1;
    };


    Fire.AudioContext = AudioContext;
})();

Fire._RFpop();
},{}],"sprite-animation-clip":[function(require,module,exports){
Fire._RFpush('sprite-animation-clip');
// sprite-animation-clip.js

// 动画剪辑

var SpriteAnimationClip = Fire.extend('Fire.SpriteAnimationClip', Fire.CustomAsset, function () {
    this._frameInfoFrames = null; // the array of the end frame of each frame info
});

Fire.addCustomAssetMenu(SpriteAnimationClip, "Create/New Sprite Animation");

SpriteAnimationClip.WrapMode = (function (t) {
    t[t.Default = 0] = 'Default';
    t[t.Once = 1] = 'Once';
    t[t.Loop = 2] = 'Loop';
    t[t.PingPong = 3] = 'PingPong';
    t[t.ClampForever = 4] = 'ClampForever';
    return t;
})({});

SpriteAnimationClip.StopAction = (function (t) {
    t[t.DoNothing = 0] = 'DoNothing';         // do nothing
    t[t.DefaultSprite = 1] = 'DefaultSprite'; // set to default sprite when the sprite animation stopped
    t[t.Hide = 2] = 'Hide';                   // hide the sprite when the sprite animation stopped
    t[t.Destroy = 3] = 'Destroy';             // destroy the entity the sprite belongs to when the sprite animation stopped
    return t;
})({});

// ------------------------------------------------------------------
/// The structure to descrip a frame in the sprite animation clip
// ------------------------------------------------------------------

var FrameInfo = Fire.define('FrameInfo')
                    .prop('sprite', null, Fire.ObjectType(Fire.Sprite))
                    .prop('frames', 0, Fire.Integer);

///< the list of frame info
// to do

// default wrap mode
SpriteAnimationClip.prop('wrapMode', SpriteAnimationClip.WrapMode.Default, Fire.Enum(SpriteAnimationClip.WrapMode));

// the default type of action used when the animation stopped
SpriteAnimationClip.prop('stopAction', SpriteAnimationClip.StopAction.DoNothing, Fire.Enum(SpriteAnimationClip.StopAction));

// the default speed of the animation clip
SpriteAnimationClip.prop('speed', 1);

// the sample rate used in this animation clip
SpriteAnimationClip.prop('_frameRate', 60, Fire.HideInInspector);
SpriteAnimationClip.getset('frameRate',
    function () {
        return this._frameRate;
    },
    function (value) {
        if (value !== this._frameRate) {
            this._frameRate = Math.round(Math.max(value, 1));
        }
    }
);

SpriteAnimationClip.prop('frameInfos', [], Fire.ObjectType(FrameInfo));


SpriteAnimationClip.prototype.getTotalFrames = function () {
    var frames = 0;
    for (var i = 0; i < this.frameInfos.length; ++i) {
        frames += this.frameInfos[i].frames;
    }
    return frames;
};

SpriteAnimationClip.prototype.getFrameInfoFrames = function () {
    if (this._frameInfoFrames === null) {
        this._frameInfoFrames = new Array(this.frameInfos.length);
        var totalFrames = 0;
        for (var i = 0; i < this.frameInfos.length; ++i) {
            totalFrames += this.frameInfos[i].frames;
            this._frameInfoFrames[i] = totalFrames;
        }
    }
    return this._frameInfoFrames;
};

module.exports = SpriteAnimationClip;

Fire._RFpop();
},{}],"sprite-animation-state":[function(require,module,exports){
Fire._RFpush('sprite-animation-state');
// sprite-animation-state.js

var SpriteAnimationClip = require('sprite-animation-clip');

var SpriteAnimationState = function (name, animClip) {
    if (!animClip) {
// @if DEV
        Fire.error('Unspecified sprite animation clip');
// @endif
        return;
    }
    // the name of the sprite animation state
    this.name = name;
    // the referenced sprite sprite animation clip
    this.clip = animClip;
    // the wrap mode
    this.wrapMode = animClip.wrapMode;
    // the stop action
    this.stopAction = animClip.stopAction;
    // the speed to play the sprite animation clip
    this.speed = animClip.speed;
    // the array of the end frame of each frame info in the sprite animation clip
    this._frameInfoFrames = animClip.getFrameInfoFrames();
    // the total frame count of the sprite animation clip
    this.totalFrames = this._frameInfoFrames.length > 0 ? this._frameInfoFrames[this._frameInfoFrames.length - 1] : 0;
    // the length of the sprite animation in seconds with speed = 1.0f
    this.length = this.totalFrames / animClip.frameRate;
    // The current index of frame. The value can be larger than totalFrames.
    // If the frame is larger than totalFrames it will be wrapped according to wrapMode. 
    this.frame = -1;
    // the current time in seoncds
    this.time = 0;
    // cache result of GetCurrentIndex
    this._cachedIndex = -1;
};

/**
 * @returns {number} - the current frame info index.
 */
SpriteAnimationState.prototype.getCurrentIndex = function () {
    if (this.totalFrames > 1) {
        //int oldFrame = frame;
        this.frame = Math.floor(this.time * this.clip.frameRate);
        if (this.frame < 0) {
            this.frame = -this.frame;
        }

        var wrappedIndex;
        if (this.wrapMode !== SpriteAnimationClip.WrapMode.PingPong) {
            wrappedIndex = _wrap(this.frame, this.totalFrames - 1, this.wrapMode);
        }
        else {
            wrappedIndex = this.frame;
            var cnt = Math.floor(wrappedIndex / this.totalFrames);
            wrappedIndex %= this.totalFrames;
            if ((cnt & 0x1) === 1) {
                wrappedIndex = this.totalFrames - 1 - wrappedIndex;
            }
        }

        // try to use cached frame info index
        if (this._cachedIndex - 1 >= 0 &&
            wrappedIndex >= this._frameInfoFrames[this._cachedIndex - 1] &&
            wrappedIndex < this._frameInfoFrames[this._cachedIndex]) {
            return this._cachedIndex;
        }

        // search frame info
        var frameInfoIndex = _binarySearch(this._frameInfoFrames, wrappedIndex + 1);
        if (frameInfoIndex < 0) {
            frameInfoIndex = ~frameInfoIndex;
        }
        this._cachedIndex = frameInfoIndex;
        return frameInfoIndex;
    }
    else if (this.totalFrames === 1) {
        return 0;
    }
    else {
        return -1;
    }
};

// ------------------------------------------------------------------ 
/// C# Array.BinarySearch
// ------------------------------------------------------------------ 
function _binarySearch (array, value) {
    var l = 0, h = array.length - 1;
    while (l <= h) {
        var m = ((l + h) >> 1);
        if (array[m] === value) {
            return m;
        }
        if (array[m] > value) {
            h = m - 1;
        }
        else {
            l = m + 1;
        }
    }
    return ~l;
}

function _wrap (_value, _maxValue, _wrapMode) {
    if (_maxValue === 0) {
        return 0;
    }
    if (_value < 0) {
        _value = -_value;
    }
    if (_wrapMode === SpriteAnimationClip.WrapMode.Loop) {
        return _value % (_maxValue + 1);
    }
    else if (_wrapMode === SpriteAnimationClip.WrapMode.PingPong) {
        var cnt = Math.floor(_value / _maxValue);
        _value %= _maxValue;
        if (cnt % 2 === 1) {
            return _maxValue - _value;
        }
    }
    else {
        if (_value < 0) {
            return 0;
        }
        if (_value > _maxValue) {
            return _maxValue;
        }
    }
    return _value;
}

module.exports = SpriteAnimationState;

Fire._RFpop();
},{"sprite-animation-clip":"sprite-animation-clip"}],"sprite-animation":[function(require,module,exports){
Fire._RFpush('sprite-animation');
// sprite-animation.js

var SpriteAnimationClip = require('sprite-animation-clip');
var SpriteAnimationState = require('sprite-animation-state');

// 定义一个名叫Sprite Animation 组件
var SpriteAnimation = Fire.extend('Fire.SpriteAnimation', Fire.Component, function () {
    this.animations = [];
    this._nameToState = {};
    this._curAnimation = null;
    this._spriteRenderer = null;
    this._defaultSprite = null;
    this._lastFrameIndex = -1;
    this._curIndex = -1;
    this._playStartFrame = 0;// 在调用Play的当帧的LateUpdate不进行step
});

Fire.addComponentMenu(SpriteAnimation, 'Sprite Animation');

SpriteAnimation.prop('defaultAnimation', null , Fire.ObjectType(SpriteAnimationClip));

SpriteAnimation.prop('animations', [], Fire.ObjectType(SpriteAnimationClip));

SpriteAnimation.prop('_playAutomatically', true, Fire.HideInInspector);
SpriteAnimation.getset('playAutomatically',
    function () {
        return this._playAutomatically;
    },
    function (value) {
        this._playAutomatically = value;
    }
);

SpriteAnimation.prototype.getAnimState = function (animClip) {

    this._spriteRenderer = this.entity.getComponent(Fire.SpriteRenderer);

    var newAnimState = new SpriteAnimationState(animClip.name, animClip);

    return newAnimState;
};

SpriteAnimation.prototype.init = function () {
    var initialized = (this.nameToState !== null);
    if (initialized === false) {
        this.sprite_ = this.entity.getComponent(Fire.Sprite);
        this._defaultSprite = sprite_;

        this.nameToState = {};
        for (var i = 0; i < this.animations.length; ++i) {
            var clip = this.animations[i];
            if (clip !== null) {
                var state = new SpriteAnimationState(clip);
                this.nameToState[state.name] = state;
                if (this.defaultAnimation === clip) {
                    this.curAnimation = state;
                    this.lastFrameIndex = -1;
                }
            }
        }
    }
};

SpriteAnimation.prototype.play = function (animState, time) {
    this._curAnimation = animState;
    if (this._curAnimation !== null) {
        this._curIndex = -1;
        this._curAnimation.time = time;
        this._playStartFrame = Fire.Time.frameCount;
        this.sample();
    }
};

SpriteAnimation.prototype.onLoad = function () {
    if (this.enabled) {
        if (this._playAutomatically && this.defaultAnimation) {
            var animState = this.getAnimState(this.defaultAnimation);
            this.play(animState, 0);
        }
    }
};

SpriteAnimation.prototype.lateUpdate = function () {
    if (this._curAnimation !== null && Fire.Time.frameCount > this._playStartFrame) {
        var delta = Fire.Time.deltaTime * this._curAnimation.speed;
        this.step(delta);
    }
};

SpriteAnimation.prototype.step = function (deltaTime) {
    if (this._curAnimation !== null) {
        this._curAnimation.time += deltaTime;
        this.sample();
        var stop = false;
        if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Once ||
            this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.Default ||
            this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
            if (this._curAnimation.speed > 0 && this._curAnimation.frame >= this._curAnimation.totalFrames) {
                if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                    stop = false;
                    this._curAnimation.frame = this._curAnimation.totalFrames;
                    this._curAnimation.time = this._curAnimation.frame / this._curAnimation.clip.frameRate;
                }
                else {
                    stop = true;
                    this._curAnimation.frame = this._curAnimation.totalFrames;
                }
            }
            else if (this._curAnimation.speed < 0 && this._curAnimation.frame < 0) {
                if (this._curAnimation.wrapMode === SpriteAnimationClip.WrapMode.ClampForever) {
                    stop = false;
                    this._curAnimation.time = 0;
                    this._curAnimation.frame = 0;
                }
                else {
                    stop = true;
                    this._curAnimation.frame = 0;
                }
            }
        }

        // do stop
        if (stop) {
            this.stop(this._curAnimation);
        }
    }
    else {
        this._curIndex = -1;
    }
};

SpriteAnimation.prototype.sample = function () {
    if (this._curAnimation !== null) {
        var newIndex = this._curAnimation.getCurrentIndex();
        if (newIndex >= 0 && newIndex != this._curIndex) {
            this._spriteRenderer.sprite = this._curAnimation.clip.frameInfos[newIndex].sprite;
        }
        this._curIndex = newIndex;
    }
    else {
        this._curIndex = -1;
    }
};

SpriteAnimation.prototype.stop = function (animState) {
    if ( animState !== null ) {
        if (animState === this._curAnimation) {
            this._curAnimation = null;
        }
        animState.time = 0;

        var stopAction = animState.stopAction;
        switch (stopAction) {
            case SpriteAnimationClip.StopAction.DoNothing:
                break;
            case SpriteAnimationClip.StopAction.DefaultSprite:
                this._spriteRenderer.sprite = this._defaultSprite;
                break;
            case SpriteAnimationClip.StopAction.Hide:
                this._spriteRenderer.enabled = false;
                break;
            case SpriteAnimationClip.StopAction.Destroy:

                break;
            default:
                break;
        }
        this._curAnimation = null;
    }
};

module.exports = SpriteAnimation;

Fire._RFpop();
},{"sprite-animation-clip":"sprite-animation-clip","sprite-animation-state":"sprite-animation-state"}]},{},["audio-clip","audio-legacy","audio-source","audio-web-audio","sprite-animation-clip","sprite-animation-state","sprite-animation"])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL2Rldi9iaW4vbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc3JjL2F1ZGlvLWNsaXAuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NyYy9hdWRpby1sZWdhY3kuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NyYy9hdWRpby1zb3VyY2UuanMiLCIuLi8uLi8uLi9kZXYvYmluL3NyYy9hdWRpby13ZWItYXVkaW8uanMiLCIuLi8uLi8uLi9kZXYvYmluL3Nwcml0ZS1hbmltYXRpb24tY2xpcC5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc3ByaXRlLWFuaW1hdGlvbi1zdGF0ZS5qcyIsIi4uLy4uLy4uL2Rldi9iaW4vc3ByaXRlLWFuaW1hdGlvbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDcElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdElBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIkZpcmUuX1JGcHVzaCgnYXVkaW8tY2xpcCcpO1xuLy8gc3JjL2F1ZGlvLWNsaXAuanNcblxuRmlyZS5BdWRpb0NsaXAgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBBdWRpb0NsaXAgPSBGaXJlLmV4dGVuZChcIkZpcmUuQXVkaW9DbGlwXCIsIEZpcmUuQXNzZXQpO1xuXG4gICAgQXVkaW9DbGlwLnByb3AoJ3Jhd0RhdGEnLCBudWxsLCBGaXJlLlJhd1R5cGUoJ2F1ZGlvJykpO1xuXG4gICAgQXVkaW9DbGlwLmdldCgnYnVmZmVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcEJ1ZmZlcih0aGlzKTtcbiAgICB9KTtcblxuICAgIEF1ZGlvQ2xpcC5nZXQoXCJsZW5ndGhcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcExlbmd0aCh0aGlzKTtcbiAgICB9KTtcblxuICAgIEF1ZGlvQ2xpcC5nZXQoXCJzYW1wbGVzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZpcmUuQXVkaW9Db250ZXh0LmdldENsaXBTYW1wbGVzKHRoaXMpO1xuICAgIH0pO1xuXG4gICAgQXVkaW9DbGlwLmdldChcImNoYW5uZWxzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIEZpcmUuQXVkaW9Db250ZXh0LmdldENsaXBDaGFubmVscyh0aGlzKTtcbiAgICB9KTtcblxuICAgIEF1ZGlvQ2xpcC5nZXQoXCJmcmVxdWVuY3lcIiwgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gRmlyZS5BdWRpb0NvbnRleHQuZ2V0Q2xpcEZyZXF1ZW5jeSh0aGlzKTtcbiAgICB9KTtcblxuICAgIHJldHVybiBBdWRpb0NsaXA7XG59KSgpO1xuXG4vLyBjcmVhdGUgZW50aXR5IGFjdGlvblxuLy8gQGlmIEVESVRPUlxuRmlyZS5BdWRpb0NsaXAucHJvdG90eXBlLmNyZWF0ZUVudGl0eSA9IGZ1bmN0aW9uICggY2IgKSB7XG4gICAgdmFyIGVudCA9IG5ldyBGaXJlLkVudGl0eSh0aGlzLm5hbWUpO1xuXG4gICAgdmFyIGF1ZGlvU291cmNlID0gZW50LmFkZENvbXBvbmVudChGaXJlLkF1ZGlvU291cmNlKTtcblxuICAgIGF1ZGlvU291cmNlLmNsaXAgPSB0aGlzO1xuXG4gICAgaWYgKCBjYiApXG4gICAgICAgIGNiIChlbnQpO1xufTtcbi8vIEBlbmRpZlxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpcmUuQXVkaW9DbGlwO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaCgnYXVkaW8tbGVnYWN5Jyk7XG4vLyBzcmMvYXVkaW8tbGVnYWN5LmpzXG5cbihmdW5jdGlvbigpe1xuICAgIHZhciBVc2VXZWJBdWRpbyA9ICh3aW5kb3cuQXVkaW9Db250ZXh0IHx8IHdpbmRvdy53ZWJraXRBdWRpb0NvbnRleHQgfHwgd2luZG93Lm1vekF1ZGlvQ29udGV4dCk7XG4gICAgaWYgKFVzZVdlYkF1ZGlvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIEF1ZGlvQ29udGV4dCA9IHt9O1xuXG4gICAgZnVuY3Rpb24gbG9hZGVyICh1cmwsIGNhbGxiYWNrLCBvblByb2dyZXNzKSB7XG4gICAgICAgIHZhciBhdWRpbyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhdWRpb1wiKTtcbiAgICAgICAgYXVkaW8uYWRkRXZlbnRMaXN0ZW5lcihcImNhbnBsYXl0aHJvdWdoXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGF1ZGlvKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuICAgICAgICBhdWRpby5hZGRFdmVudExpc3RlbmVyKCdlcnJvcicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBjYWxsYmFjaygnTG9hZEF1ZGlvQ2xpcDogXCInICsgdXJsICtcbiAgICAgICAgICAgICAgICAgICAgJ1wiIHNlZW1zIHRvIGJlIHVucmVhY2hhYmxlIG9yIHRoZSBmaWxlIGlzIGVtcHR5LiBJbm5lck1lc3NhZ2U6ICcgKyBlLCBudWxsKTtcbiAgICAgICAgfSwgZmFsc2UpO1xuXG4gICAgICAgIGF1ZGlvLnNyYyA9IHVybDtcbiAgICAgICAgYXVkaW8ubG9hZCgpO1xuICAgIH1cblxuICAgIEZpcmUuTG9hZE1hbmFnZXIucmVnaXN0ZXJSYXdUeXBlcygnYXVkaW8nLCBsb2FkZXIpO1xuXG4gICAgQXVkaW9Db250ZXh0LmluaXRTb3VyY2UgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHRhcmdldC5fYXVkaW8gPSBudWxsO1xuICAgIH07XG5cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q3VycmVudFRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQgJiYgdGFyZ2V0Ll9hdWRpbyAmJiB0YXJnZXQuX3BsYXlpbmcpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXQuX2F1ZGlvLmN1cnJlbnRUaW1lO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZVRpbWUgPSBmdW5jdGlvbiAodGFyZ2V0LCB2YWx1ZSkge1xuICAgICAgICBpZiAodGFyZ2V0ICYmIHRhcmdldC5fYXVkaW8pIHtcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9IHRhcmdldC5fYXVkaW8uZHVyYXRpb247XG4gICAgICAgICAgICB0YXJnZXQuX2F1ZGlvLmN1cnJlbnRUaW1lID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy8g6Z2c6Z+zXG4gICAgQXVkaW9Db250ZXh0LnVwZGF0ZU11dGUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLm11dGVkID0gdGFyZ2V0Lm11dGU7XG4gICAgfTtcblxuICAgIC8vIOiuvue9rumfs+mHj++8jOmfs+mHj+iMg+WbtOaYr1swLCAxXVxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVWb2x1bWUgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLnZvbHVtZSA9IHRhcmdldC52b2x1bWU7XG4gICAgfTtcblxuICAgIC8vIOiuvue9ruW+queOr1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVMb29wID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0Ll9hdWRpbykgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5sb29wID0gdGFyZ2V0Lmxvb3A7XG4gICAgfTtcblxuICAgIC8vIOWwhumfs+S5kOa6kOiKgueCuee7keWumuWFt+S9k+eahOmfs+mikWJ1ZmZlclxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVBdWRpb0NsaXAgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0IHx8ICF0YXJnZXQuY2xpcCkgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll9hdWRpbyA9IHRhcmdldC5jbGlwLnJhd0RhdGE7XG4gICAgfTtcblxuICAgIC8vIOaaq+WBnFxuICAgIEF1ZGlvQ29udGV4dC5wYXVzZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2F1ZGlvKSB7IHJldHVybjsgfVxuICAgICAgICB0YXJnZXQuX2F1ZGlvLnBhdXNlKCk7XG4gICAgfTtcblxuICAgIC8vIOWBnOatolxuICAgIEF1ZGlvQ29udGV4dC5zdG9wID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fYXVkaW8pIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYXVkaW8ucGF1c2UoKTtcbiAgICAgICAgdGFyZ2V0Ll9hdWRpby5jdXJyZW50VGltZSA9IDA7XG4gICAgfTtcblxuICAgIC8vIOaSreaUvlxuICAgIEF1ZGlvQ29udGV4dC5wbGF5ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldCB8fCAhdGFyZ2V0LmNsaXAgfHwgIXRhcmdldC5jbGlwLnJhd0RhdGEpIHsgcmV0dXJuOyB9XG4gICAgICAgIGlmICh0YXJnZXQuX3BsYXlpbmcgJiYgIXRhcmdldC5fcGF1c2VkKSB7IHJldHVybjsgfVxuICAgICAgICB0aGlzLnVwZGF0ZUF1ZGlvQ2xpcCh0YXJnZXQpO1xuICAgICAgICB0aGlzLnVwZGF0ZVZvbHVtZSh0YXJnZXQpO1xuICAgICAgICB0aGlzLnVwZGF0ZUxvb3AodGFyZ2V0KTtcbiAgICAgICAgdGhpcy51cGRhdGVNdXRlKHRhcmdldCk7XG4gICAgICAgIHRhcmdldC5fYXVkaW8ucGxheSgpO1xuXG4gICAgICAgIC8vIOaSreaUvue7k+adn+WQjueahOWbnuiwg1xuICAgICAgICB0YXJnZXQuX2F1ZGlvLmFkZEV2ZW50TGlzdGVuZXIoJ2VuZGVkJywgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGFyZ2V0Lm9uUGxheUVuZC5iaW5kKHRhcmdldCk7XG4gICAgICAgIH0sIGZhbHNlKTtcbiAgICB9O1xuXG4gICAgLy8g6I635b6X6Z+z6aKR5Ymq6L6R55qEIGJ1ZmZlclxuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwQnVmZmVyID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDku6Xnp5LkuLrljZXkvY0g6I635Y+W6Z+z6aKR5Ymq6L6R55qEIOmVv+W6plxuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwTGVuZ3RoID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgcmV0dXJuIHRhcmdldC5jbGlwLnJhd0RhdGEuZHVyYXRpb247XG4gICAgfTtcblxuICAgIC8vIOmfs+mikeWJqui+keeahOmVv+W6plxuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwU2FtcGxlcyA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgRmlyZS5lcnJvcihcIkF1ZGlvIGRvZXMgbm90IGNvbnRhaW4gdGhlIGF0dHJpYnV0ZSFcIik7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH07XG5cbiAgICAvLyDpn7PpopHliarovpHnmoTlo7DpgZPmlbBcbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcENoYW5uZWxzID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBGaXJlLmVycm9yKFwiQXVkaW8gZG9lcyBub3QgY29udGFpbiB0aGUgYXR0cmlidXRlIVwiKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuICAgIC8vIOmfs+mikeWJqui+keeahOmHh+agt+mikeeOh1xuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwRnJlcXVlbmN5ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBGaXJlLmVycm9yKFwiQXVkaW8gZG9lcyBub3QgY29udGFpbiB0aGUgYXR0cmlidXRlIVwiKTtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfTtcblxuXG4gICAgRmlyZS5BdWRpb0NvbnRleHQgPSBBdWRpb0NvbnRleHQ7XG59KSgpO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaCgnYXVkaW8tc291cmNlJyk7XG4vLyBzcmMvYXVkaW8tc291cmNlLmpzXG5cbnZhciBBdWRpb1NvdXJjZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIEF1ZGlvU291cmNlID0gRmlyZS5leHRlbmQoXCJGaXJlLkF1ZGlvU291cmNlXCIsIEZpcmUuQ29tcG9uZW50LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTsgLy8tLSDlo7DmupDmmoLlgZzmiJbogIXlgZzmraLml7blgJnkuLpmYWxzZVxuICAgICAgICB0aGlzLl9wYXVzZWQgPSBmYWxzZTsvLy0tIOadpeWMuuWIhuWjsOa6kOaYr+aaguWBnOi/mOaYr+WBnOatolxuXG4gICAgICAgIHRoaXMuX3N0YXJ0VGltZSA9IDA7XG4gICAgICAgIHRoaXMuX2xhc3RQbGF5ID0gMDtcblxuICAgICAgICB0aGlzLl9idWZmU291cmNlID0gbnVsbDtcbiAgICAgICAgdGhpcy5fdm9sdW1lR2FpbiA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5vbkVuZCA9IG51bGw7XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIEZpcmUuYWRkQ29tcG9uZW50TWVudShBdWRpb1NvdXJjZSwgJ0F1ZGlvU291cmNlJyk7XG5cbiAgICAvL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdWRpb1NvdXJjZS5wcm90b3R5cGUsIFwiaXNQbGF5aW5nXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGxheWluZyAmJiAhdGhpcy5fcGF1c2VkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkoQXVkaW9Tb3VyY2UucHJvdG90eXBlLCBcImlzUGF1c2VkXCIsIHtcbiAgICAgICAgZ2V0OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcGF1c2VkO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShBdWRpb1NvdXJjZS5wcm90b3R5cGUsICd0aW1lJywge1xuICAgICAgICBnZXQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiBGaXJlLkF1ZGlvQ29udGV4dC5nZXRDdXJyZW50VGltZSh0aGlzKTtcbiAgICAgICAgfSxcbiAgICAgICAgc2V0OiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZVRpbWUodGhpcywgdmFsdWUpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICAvL1xuICAgIEF1ZGlvU291cmNlLnByb3AoJ19wbGF5YmFja1JhdGUnLCAxLjAsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ3BsYXliYWNrUmF0ZScsXG4gICAgICAgIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9wbGF5YmFja1JhdGU7XG4gICAgICAgIH0sXG4gICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMuX3BsYXliYWNrUmF0ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9wbGF5YmFja1JhdGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC51cGRhdGVQbGF5YmFja1JhdGUodGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICApO1xuXG4gICAgLy9cbiAgICBBdWRpb1NvdXJjZS5wcm9wKCdfY2xpcCcsIG51bGwsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ2NsaXAnLFxuICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fY2xpcDtcbiAgICAgICAgfSxcbiAgICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5fY2xpcCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9jbGlwID0gdmFsdWU7XG4gICAgICAgICAgICAgICAgRmlyZS5BdWRpb0NvbnRleHQudXBkYXRlQXVkaW9DbGlwKHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBGaXJlLk9iamVjdFR5cGUoRmlyZS5BdWRpb0NsaXApXG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX2xvb3AnLCBmYWxzZSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuICAgIEF1ZGlvU291cmNlLmdldHNldCgnbG9vcCcsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9vcDtcbiAgICAgICB9LFxuICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICBpZiAodGhpcy5fbG9vcCAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgIHRoaXMuX2xvb3AgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZUxvb3AodGhpcyk7XG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX211dGUnLCBmYWxzZSwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuICAgIEF1ZGlvU291cmNlLmdldHNldCgnbXV0ZScsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fbXV0ZTtcbiAgICAgICB9LFxuICAgICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICBpZiAodGhpcy5fbXV0ZSAhPT0gdmFsdWUpIHtcbiAgICAgICAgICAgICAgIHRoaXMuX211dGUgPSB2YWx1ZTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZU11dGUodGhpcyk7XG4gICAgICAgICAgIH1cbiAgICAgICB9XG4gICAgKTtcblxuICAgIC8vXG4gICAgQXVkaW9Tb3VyY2UucHJvcCgnX3ZvbHVtZScsIDEsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcbiAgICBBdWRpb1NvdXJjZS5nZXRzZXQoJ3ZvbHVtZScsXG4gICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICByZXR1cm4gdGhpcy5fdm9sdW1lO1xuICAgICAgIH0sXG4gICAgICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgICAgIGlmICh0aGlzLl92b2x1bWUgIT09IHZhbHVlKSB7XG4gICAgICAgICAgICAgICB0aGlzLl92b2x1bWUgPSBNYXRoLmNsYW1wKHZhbHVlKTtcbiAgICAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnVwZGF0ZVZvbHVtZSh0aGlzKTtcbiAgICAgICAgICAgfVxuICAgICAgIH0sXG4gICAgICAgRmlyZS5SYW5nZSgwLDEpXG4gICAgKTtcblxuICAgIEF1ZGlvU291cmNlLnByb3AoJ3BsYXlPbkF3YWtlJywgdHJ1ZSk7XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUub25QbGF5RW5kID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIHRoaXMub25FbmQgKSB7XG4gICAgICAgICAgICB0aGlzLm9uRW5kKCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9wbGF5aW5nID0gZmFsc2U7XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUucGF1c2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5fcGF1c2VkIClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5wYXVzZSh0aGlzKTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICggdGhpcy5fcGxheWluZyAmJiAhdGhpcy5fcGF1c2VkIClcbiAgICAgICAgICAgIHJldHVybjtcblxuICAgICAgICBpZiAoIHRoaXMuX3BhdXNlZCApXG4gICAgICAgICAgICBGaXJlLkF1ZGlvQ29udGV4dC5wbGF5KHRoaXMsIHRoaXMuX3N0YXJ0VGltZSk7XG4gICAgICAgIGVsc2VcbiAgICAgICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnBsYXkodGhpcywgMCk7XG5cbiAgICAgICAgdGhpcy5fcGxheWluZyA9IHRydWU7XG4gICAgICAgIHRoaXMuX3BhdXNlZCA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBBdWRpb1NvdXJjZS5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKCAhdGhpcy5fcGxheWluZyApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIEZpcmUuQXVkaW9Db250ZXh0LnN0b3AodGhpcyk7XG4gICAgICAgIHRoaXMuX3BsYXlpbmcgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5fcGF1c2VkID0gZmFsc2U7XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9wbGF5aW5nICkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXVkaW9Tb3VyY2UucHJvdG90eXBlLm9uU3RhcnQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vaWYgKHRoaXMucGxheU9uQXdha2UpIHtcbiAgICAgICAgLy8gICAgY29uc29sZS5sb2coXCJvblN0YXJ0XCIpO1xuICAgICAgICAvLyAgICB0aGlzLnBsYXkoKTtcbiAgICAgICAgLy99XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkVuYWJsZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHRoaXMucGxheU9uQXdha2UpIHtcbiAgICAgICAgICAgIHRoaXMucGxheSgpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEF1ZGlvU291cmNlLnByb3RvdHlwZS5vbkRpc2FibGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc3RvcCgpO1xuICAgIH07XG5cbiAgICByZXR1cm4gQXVkaW9Tb3VyY2U7XG59KSgpO1xuXG5GaXJlLkF1ZGlvU291cmNlID0gQXVkaW9Tb3VyY2U7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKCdhdWRpby13ZWItYXVkaW8nKTtcbi8vIHNyYy9hdWRpby13ZWItYXVkaW8uanNcblxuKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgTmF0aXZlQXVkaW9Db250ZXh0ID0gKHdpbmRvdy5BdWRpb0NvbnRleHQgfHwgd2luZG93LndlYmtpdEF1ZGlvQ29udGV4dCB8fCB3aW5kb3cubW96QXVkaW9Db250ZXh0KTtcbiAgICBpZiAoICFOYXRpdmVBdWRpb0NvbnRleHQgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBmaXggZmlyZWJhbGwteC9kZXYjMzY1XG4gICAgaWYgKCFGaXJlLm5hdGl2ZUFDKSB7XG4gICAgICAgIEZpcmUubmF0aXZlQUMgPSBuZXcgTmF0aXZlQXVkaW9Db250ZXh0KCk7XG4gICAgfVxuXG4gICAgLy8g5re75Yqgc2FmZURlY29kZUF1ZGlvRGF0YeeahOWOn+WboO+8mmh0dHBzOi8vZ2l0aHViLmNvbS9maXJlYmFsbC14L2Rldi9pc3N1ZXMvMzE4XG4gICAgZnVuY3Rpb24gc2FmZURlY29kZUF1ZGlvRGF0YShjb250ZXh0LCBidWZmZXIsIHVybCwgY2FsbGJhY2spIHtcbiAgICAgICAgdmFyIHRpbWVvdXQgPSBmYWxzZTtcbiAgICAgICAgdmFyIHRpbWVySWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKCdUaGUgb3BlcmF0aW9uIG9mIGRlY29kaW5nIGF1ZGlvIGRhdGEgYWxyZWFkeSB0aW1lb3V0ISBBdWRpbyB1cmw6IFwiJyArIHVybCArXG4gICAgICAgICAgICAgICAgICAgICAnXCIuIFNldCBGaXJlLkF1ZGlvQ29udGV4dC5NYXhEZWNvZGVUaW1lIHRvIGEgbGFyZ2VyIHZhbHVlIGlmIHRoaXMgZXJyb3Igb2Z0ZW4gb2NjdXIuICcgK1xuICAgICAgICAgICAgICAgICAgICAgJ1NlZSBmaXJlYmFsbC14L2RldiMzMTggZm9yIGRldGFpbHMuJywgbnVsbCk7XG4gICAgICAgIH0sIEF1ZGlvQ29udGV4dC5NYXhEZWNvZGVUaW1lKTtcblxuICAgICAgICBjb250ZXh0LmRlY29kZUF1ZGlvRGF0YShidWZmZXIsXG4gICAgICAgICAgICBmdW5jdGlvbiAoZGVjb2RlZERhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXRpbWVvdXQpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sobnVsbCwgZGVjb2RlZERhdGEpO1xuICAgICAgICAgICAgICAgICAgICBjbGVhclRpbWVvdXQodGltZXJJZCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF0aW1lb3V0KSB7XG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsICdMb2FkQXVkaW9DbGlwOiBcIicgKyB1cmwgK1xuICAgICAgICAgICAgICAgICAgICAgICAgJ1wiIHNlZW1zIHRvIGJlIHVucmVhY2hhYmxlIG9yIHRoZSBmaWxlIGlzIGVtcHR5LiBJbm5lck1lc3NhZ2U6ICcgKyBlKTtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVySWQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBsb2FkZXIodXJsLCBjYWxsYmFjaywgb25Qcm9ncmVzcykge1xuICAgICAgICB2YXIgY2IgPSBjYWxsYmFjayAmJiBmdW5jdGlvbiAoZXJyb3IsIHhocikge1xuICAgICAgICAgICAgaWYgKHhocikge1xuICAgICAgICAgICAgICAgIHNhZmVEZWNvZGVBdWRpb0RhdGEoRmlyZS5uYXRpdmVBQywgeGhyLnJlc3BvbnNlLCB1cmwsIGNhbGxiYWNrKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKCdMb2FkQXVkaW9DbGlwOiBcIicgKyB1cmwgK1xuICAgICAgICAgICAgICAgJ1wiIHNlZW1zIHRvIGJlIHVucmVhY2hhYmxlIG9yIHRoZSBmaWxlIGlzIGVtcHR5LiBJbm5lck1lc3NhZ2U6ICcgKyBlcnJvciwgbnVsbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIEZpcmUuTG9hZE1hbmFnZXIuX2xvYWRGcm9tWEhSKHVybCwgY2IsIG9uUHJvZ3Jlc3MsICdhcnJheWJ1ZmZlcicpO1xuICAgIH1cblxuICAgIEZpcmUuTG9hZE1hbmFnZXIucmVnaXN0ZXJSYXdUeXBlcygnYXVkaW8nLCBsb2FkZXIpO1xuXG4gICAgdmFyIEF1ZGlvQ29udGV4dCA9IHt9O1xuXG4gICAgQXVkaW9Db250ZXh0Lk1heERlY29kZVRpbWUgPSAzMDAwO1xuXG4gICAgQXVkaW9Db250ZXh0LmdldEN1cnJlbnRUaW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIHRhcmdldC5fcGF1c2VkICkge1xuICAgICAgICAgICAgcmV0dXJuIHRhcmdldC5fc3RhcnRUaW1lO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCB0YXJnZXQuX3BsYXlpbmcgKSB7XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0Ll9zdGFydFRpbWUgKyB0aGlzLmdldFBsYXllZFRpbWUodGFyZ2V0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAwO1xuICAgIH07XG5cbiAgICBBdWRpb0NvbnRleHQuZ2V0UGxheWVkVGltZSA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuIChGaXJlLm5hdGl2ZUFDLmN1cnJlbnRUaW1lIC0gdGFyZ2V0Ll9sYXN0UGxheSkgKiB0YXJnZXQuX3BsYXliYWNrUmF0ZTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlVGltZSA9IGZ1bmN0aW9uICh0YXJnZXQsIHRpbWUpIHtcbiAgICAgICAgdGFyZ2V0Ll9sYXN0UGxheSA9IEZpcmUubmF0aXZlQUMuY3VycmVudFRpbWU7XG4gICAgICAgIHRhcmdldC5fc3RhcnRUaW1lID0gdGltZTtcblxuICAgICAgICBpZiAoIHRhcmdldC5pc1BsYXlpbmcgKSB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlKHRhcmdldCk7XG4gICAgICAgICAgICB0aGlzLnBsYXkodGFyZ2V0KTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVNdXRlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fdm9sdW1lR2FpbikgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll92b2x1bWVHYWluLmdhaW4udmFsdWUgPSB0YXJnZXQubXV0ZSA/IC0xIDogKHRhcmdldC52b2x1bWUgLSAxKTtcbiAgICB9O1xuXG4gICAgLy8gcmFuZ2UgWzAsMV1cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlVm9sdW1lID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoIXRhcmdldC5fdm9sdW1lR2FpbikgeyByZXR1cm47IH1cbiAgICAgICAgdGFyZ2V0Ll92b2x1bWVHYWluLmdhaW4udmFsdWUgPSB0YXJnZXQudm9sdW1lIC0gMTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlTG9vcCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXQuX2J1ZmZTb3VyY2UpIHsgcmV0dXJuOyB9XG4gICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZS5sb29wID0gdGFyZ2V0Lmxvb3A7XG4gICAgfTtcblxuICAgIC8vIGJpbmQgYnVmZmVyIHNvdXJjZVxuICAgIEF1ZGlvQ29udGV4dC51cGRhdGVBdWRpb0NsaXAgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICggdGFyZ2V0LmlzUGxheWluZyApIHtcbiAgICAgICAgICAgIHRoaXMuc3RvcCh0YXJnZXQsZmFsc2UpO1xuICAgICAgICAgICAgdGhpcy5wbGF5KHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQudXBkYXRlUGxheWJhY2tSYXRlID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICBpZiAoICF0aGlzLmlzUGF1c2VkICkge1xuICAgICAgICAgICAgdGhpcy5wYXVzZSh0YXJnZXQpO1xuICAgICAgICAgICAgdGhpcy5wbGF5KHRhcmdldCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQucGF1c2UgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9idWZmU291cmNlKSB7IHJldHVybjsgfVxuXG4gICAgICAgIHRhcmdldC5fc3RhcnRUaW1lICs9IHRoaXMuZ2V0UGxheWVkVGltZSh0YXJnZXQpO1xuICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2Uub25lbmRlZCA9IG51bGw7XG4gICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZS5zdG9wKCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnN0b3AgPSBmdW5jdGlvbiAoIHRhcmdldCwgZW5kZWQgKSB7XG4gICAgICAgIGlmICghdGFyZ2V0Ll9idWZmU291cmNlKSB7IHJldHVybjsgfVxuXG4gICAgICAgIGlmICggIWVuZGVkICkge1xuICAgICAgICAgICAgdGFyZ2V0Ll9idWZmU291cmNlLm9uZW5kZWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHRhcmdldC5fYnVmZlNvdXJjZS5zdG9wKCk7XG4gICAgfTtcblxuICAgIC8vXG4gICAgQXVkaW9Db250ZXh0LnBsYXkgPSBmdW5jdGlvbiAoIHRhcmdldCwgYXQgKSB7XG4gICAgICAgIGlmICghdGFyZ2V0LmNsaXAgfHwgIXRhcmdldC5jbGlwLnJhd0RhdGEpIHsgcmV0dXJuOyB9XG5cbiAgICAgICAgLy8gY3JlYXRlIGJ1ZmZlciBzb3VyY2VcbiAgICAgICAgdmFyIGJ1ZmZlclNvdXJjZSA9IEZpcmUubmF0aXZlQUMuY3JlYXRlQnVmZmVyU291cmNlKCk7XG5cbiAgICAgICAgLy8gY3JlYXRlIHZvbHVtZSBjb250cm9sXG4gICAgICAgIHZhciBnYWluID0gRmlyZS5uYXRpdmVBQy5jcmVhdGVHYWluKCk7XG5cbiAgICAgICAgLy8gY29ubmVjdFxuICAgICAgICBidWZmZXJTb3VyY2UuY29ubmVjdChnYWluKTtcbiAgICAgICAgZ2Fpbi5jb25uZWN0KEZpcmUubmF0aXZlQUMuZGVzdGluYXRpb24pO1xuICAgICAgICBidWZmZXJTb3VyY2UuY29ubmVjdChGaXJlLm5hdGl2ZUFDLmRlc3RpbmF0aW9uKTtcblxuICAgICAgICAvLyBpbml0IHBhcmFtZXRlcnNcbiAgICAgICAgYnVmZmVyU291cmNlLmJ1ZmZlciA9IHRhcmdldC5jbGlwLnJhd0RhdGE7XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5sb29wID0gdGFyZ2V0Lmxvb3A7XG4gICAgICAgIGJ1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSB0YXJnZXQucGxheWJhY2tSYXRlO1xuICAgICAgICBidWZmZXJTb3VyY2Uub25lbmRlZCA9IHRhcmdldC5vblBsYXlFbmQuYmluZCh0YXJnZXQpO1xuICAgICAgICBnYWluLmdhaW4udmFsdWUgPSB0YXJnZXQubXV0ZSA/IC0xIDogKHRhcmdldC52b2x1bWUgLSAxKTtcblxuICAgICAgICAvL1xuICAgICAgICB0YXJnZXQuX2J1ZmZTb3VyY2UgPSBidWZmZXJTb3VyY2U7XG4gICAgICAgIHRhcmdldC5fdm9sdW1lR2FpbiA9IGdhaW47XG4gICAgICAgIHRhcmdldC5fc3RhcnRUaW1lID0gYXQgfHwgMDtcbiAgICAgICAgdGFyZ2V0Ll9sYXN0UGxheSA9IEZpcmUubmF0aXZlQUMuY3VycmVudFRpbWU7XG5cbiAgICAgICAgLy8gcGxheVxuICAgICAgICBidWZmZXJTb3VyY2Uuc3RhcnQoIDAsIHRoaXMuZ2V0Q3VycmVudFRpbWUodGFyZ2V0KSApO1xuICAgIH07XG5cbiAgICAvLyA9PT09PT09PT09PT09PT09PT09XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwQnVmZmVyID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgcmV0dXJuIGNsaXAucmF3RGF0YTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcExlbmd0aCA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIGlmIChjbGlwLnJhd0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGEuZHVyYXRpb247XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG5cbiAgICAvL1xuICAgIEF1ZGlvQ29udGV4dC5nZXRDbGlwU2FtcGxlcyA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIGlmIChjbGlwLnJhd0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGEubGVuZ3RoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcENoYW5uZWxzID0gZnVuY3Rpb24gKGNsaXApIHtcbiAgICAgICAgaWYgKGNsaXAucmF3RGF0YSkge1xuICAgICAgICAgICAgcmV0dXJuIGNsaXAucmF3RGF0YS5udW1iZXJPZkNoYW5uZWxzO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuXG4gICAgLy9cbiAgICBBdWRpb0NvbnRleHQuZ2V0Q2xpcEZyZXF1ZW5jeSA9IGZ1bmN0aW9uIChjbGlwKSB7XG4gICAgICAgIGlmIChjbGlwLnJhd0RhdGEpIHtcbiAgICAgICAgICAgIHJldHVybiBjbGlwLnJhd0RhdGEuc2FtcGxlUmF0ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfTtcblxuXG4gICAgRmlyZS5BdWRpb0NvbnRleHQgPSBBdWRpb0NvbnRleHQ7XG59KSgpO1xuXG5GaXJlLl9SRnBvcCgpOyIsIkZpcmUuX1JGcHVzaCgnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLWNsaXAuanNcblxuLy8g5Yqo55S75Ymq6L6RXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gRmlyZS5leHRlbmQoJ0ZpcmUuU3ByaXRlQW5pbWF0aW9uQ2xpcCcsIEZpcmUuQ3VzdG9tQXNzZXQsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLl9mcmFtZUluZm9GcmFtZXMgPSBudWxsOyAvLyB0aGUgYXJyYXkgb2YgdGhlIGVuZCBmcmFtZSBvZiBlYWNoIGZyYW1lIGluZm9cbn0pO1xuXG5GaXJlLmFkZEN1c3RvbUFzc2V0TWVudShTcHJpdGVBbmltYXRpb25DbGlwLCBcIkNyZWF0ZS9OZXcgU3ByaXRlIEFuaW1hdGlvblwiKTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZSA9IChmdW5jdGlvbiAodCkge1xuICAgIHRbdC5EZWZhdWx0ID0gMF0gPSAnRGVmYXVsdCc7XG4gICAgdFt0Lk9uY2UgPSAxXSA9ICdPbmNlJztcbiAgICB0W3QuTG9vcCA9IDJdID0gJ0xvb3AnO1xuICAgIHRbdC5QaW5nUG9uZyA9IDNdID0gJ1BpbmdQb25nJztcbiAgICB0W3QuQ2xhbXBGb3JldmVyID0gNF0gPSAnQ2xhbXBGb3JldmVyJztcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uID0gKGZ1bmN0aW9uICh0KSB7XG4gICAgdFt0LkRvTm90aGluZyA9IDBdID0gJ0RvTm90aGluZyc7ICAgICAgICAgLy8gZG8gbm90aGluZ1xuICAgIHRbdC5EZWZhdWx0U3ByaXRlID0gMV0gPSAnRGVmYXVsdFNwcml0ZSc7IC8vIHNldCB0byBkZWZhdWx0IHNwcml0ZSB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbiAgICB0W3QuSGlkZSA9IDJdID0gJ0hpZGUnOyAgICAgICAgICAgICAgICAgICAvLyBoaWRlIHRoZSBzcHJpdGUgd2hlbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdG9wcGVkXG4gICAgdFt0LkRlc3Ryb3kgPSAzXSA9ICdEZXN0cm95JzsgICAgICAgICAgICAgLy8gZGVzdHJveSB0aGUgZW50aXR5IHRoZSBzcHJpdGUgYmVsb25ncyB0byB3aGVuIHRoZSBzcHJpdGUgYW5pbWF0aW9uIHN0b3BwZWRcbiAgICByZXR1cm4gdDtcbn0pKHt9KTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4vLy8gVGhlIHN0cnVjdHVyZSB0byBkZXNjcmlwIGEgZnJhbWUgaW4gdGhlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbnZhciBGcmFtZUluZm8gPSBGaXJlLmRlZmluZSgnRnJhbWVJbmZvJylcbiAgICAgICAgICAgICAgICAgICAgLnByb3AoJ3Nwcml0ZScsIG51bGwsIEZpcmUuT2JqZWN0VHlwZShGaXJlLlNwcml0ZSkpXG4gICAgICAgICAgICAgICAgICAgIC5wcm9wKCdmcmFtZXMnLCAwLCBGaXJlLkludGVnZXIpO1xuXG4vLy88IHRoZSBsaXN0IG9mIGZyYW1lIGluZm9cbi8vIHRvIGRvXG5cbi8vIGRlZmF1bHQgd3JhcCBtb2RlXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ3dyYXBNb2RlJywgU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5EZWZhdWx0LCBGaXJlLkVudW0oU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZSkpO1xuXG4vLyB0aGUgZGVmYXVsdCB0eXBlIG9mIGFjdGlvbiB1c2VkIHdoZW4gdGhlIGFuaW1hdGlvbiBzdG9wcGVkXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ3N0b3BBY3Rpb24nLCBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRG9Ob3RoaW5nLCBGaXJlLkVudW0oU3ByaXRlQW5pbWF0aW9uQ2xpcC5TdG9wQWN0aW9uKSk7XG5cbi8vIHRoZSBkZWZhdWx0IHNwZWVkIG9mIHRoZSBhbmltYXRpb24gY2xpcFxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm9wKCdzcGVlZCcsIDEpO1xuXG4vLyB0aGUgc2FtcGxlIHJhdGUgdXNlZCBpbiB0aGlzIGFuaW1hdGlvbiBjbGlwXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ19mcmFtZVJhdGUnLCA2MCwgRmlyZS5IaWRlSW5JbnNwZWN0b3IpO1xuU3ByaXRlQW5pbWF0aW9uQ2xpcC5nZXRzZXQoJ2ZyYW1lUmF0ZScsXG4gICAgZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fZnJhbWVSYXRlO1xuICAgIH0sXG4gICAgZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPT0gdGhpcy5fZnJhbWVSYXRlKSB7XG4gICAgICAgICAgICB0aGlzLl9mcmFtZVJhdGUgPSBNYXRoLnJvdW5kKE1hdGgubWF4KHZhbHVlLCAxKSk7XG4gICAgICAgIH1cbiAgICB9XG4pO1xuXG5TcHJpdGVBbmltYXRpb25DbGlwLnByb3AoJ2ZyYW1lSW5mb3MnLCBbXSwgRmlyZS5PYmplY3RUeXBlKEZyYW1lSW5mbykpO1xuXG5cblNwcml0ZUFuaW1hdGlvbkNsaXAucHJvdG90eXBlLmdldFRvdGFsRnJhbWVzID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBmcmFtZXMgPSAwO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZUluZm9zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgIGZyYW1lcyArPSB0aGlzLmZyYW1lSW5mb3NbaV0uZnJhbWVzO1xuICAgIH1cbiAgICByZXR1cm4gZnJhbWVzO1xufTtcblxuU3ByaXRlQW5pbWF0aW9uQ2xpcC5wcm90b3R5cGUuZ2V0RnJhbWVJbmZvRnJhbWVzID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLl9mcmFtZUluZm9GcmFtZXMgPT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gbmV3IEFycmF5KHRoaXMuZnJhbWVJbmZvcy5sZW5ndGgpO1xuICAgICAgICB2YXIgdG90YWxGcmFtZXMgPSAwO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZnJhbWVJbmZvcy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgdG90YWxGcmFtZXMgKz0gdGhpcy5mcmFtZUluZm9zW2ldLmZyYW1lcztcbiAgICAgICAgICAgIHRoaXMuX2ZyYW1lSW5mb0ZyYW1lc1tpXSA9IHRvdGFsRnJhbWVzO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB0aGlzLl9mcmFtZUluZm9GcmFtZXM7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFNwcml0ZUFuaW1hdGlvbkNsaXA7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKCdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLXN0YXRlLmpzXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG5cbnZhciBTcHJpdGVBbmltYXRpb25TdGF0ZSA9IGZ1bmN0aW9uIChuYW1lLCBhbmltQ2xpcCkge1xuICAgIGlmICghYW5pbUNsaXApIHtcbi8vIEBpZiBERVZcbiAgICAgICAgRmlyZS5lcnJvcignVW5zcGVjaWZpZWQgc3ByaXRlIGFuaW1hdGlvbiBjbGlwJyk7XG4vLyBAZW5kaWZcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyB0aGUgbmFtZSBvZiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBzdGF0ZVxuICAgIHRoaXMubmFtZSA9IG5hbWU7XG4gICAgLy8gdGhlIHJlZmVyZW5jZWQgc3ByaXRlIHNwcml0ZSBhbmltYXRpb24gY2xpcFxuICAgIHRoaXMuY2xpcCA9IGFuaW1DbGlwO1xuICAgIC8vIHRoZSB3cmFwIG1vZGVcbiAgICB0aGlzLndyYXBNb2RlID0gYW5pbUNsaXAud3JhcE1vZGU7XG4gICAgLy8gdGhlIHN0b3AgYWN0aW9uXG4gICAgdGhpcy5zdG9wQWN0aW9uID0gYW5pbUNsaXAuc3RvcEFjdGlvbjtcbiAgICAvLyB0aGUgc3BlZWQgdG8gcGxheSB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgdGhpcy5zcGVlZCA9IGFuaW1DbGlwLnNwZWVkO1xuICAgIC8vIHRoZSBhcnJheSBvZiB0aGUgZW5kIGZyYW1lIG9mIGVhY2ggZnJhbWUgaW5mbyBpbiB0aGUgc3ByaXRlIGFuaW1hdGlvbiBjbGlwXG4gICAgdGhpcy5fZnJhbWVJbmZvRnJhbWVzID0gYW5pbUNsaXAuZ2V0RnJhbWVJbmZvRnJhbWVzKCk7XG4gICAgLy8gdGhlIHRvdGFsIGZyYW1lIGNvdW50IG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGNsaXBcbiAgICB0aGlzLnRvdGFsRnJhbWVzID0gdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCA+IDAgPyB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fZnJhbWVJbmZvRnJhbWVzLmxlbmd0aCAtIDFdIDogMDtcbiAgICAvLyB0aGUgbGVuZ3RoIG9mIHRoZSBzcHJpdGUgYW5pbWF0aW9uIGluIHNlY29uZHMgd2l0aCBzcGVlZCA9IDEuMGZcbiAgICB0aGlzLmxlbmd0aCA9IHRoaXMudG90YWxGcmFtZXMgLyBhbmltQ2xpcC5mcmFtZVJhdGU7XG4gICAgLy8gVGhlIGN1cnJlbnQgaW5kZXggb2YgZnJhbWUuIFRoZSB2YWx1ZSBjYW4gYmUgbGFyZ2VyIHRoYW4gdG90YWxGcmFtZXMuXG4gICAgLy8gSWYgdGhlIGZyYW1lIGlzIGxhcmdlciB0aGFuIHRvdGFsRnJhbWVzIGl0IHdpbGwgYmUgd3JhcHBlZCBhY2NvcmRpbmcgdG8gd3JhcE1vZGUuIFxuICAgIHRoaXMuZnJhbWUgPSAtMTtcbiAgICAvLyB0aGUgY3VycmVudCB0aW1lIGluIHNlb25jZHNcbiAgICB0aGlzLnRpbWUgPSAwO1xuICAgIC8vIGNhY2hlIHJlc3VsdCBvZiBHZXRDdXJyZW50SW5kZXhcbiAgICB0aGlzLl9jYWNoZWRJbmRleCA9IC0xO1xufTtcblxuLyoqXG4gKiBAcmV0dXJucyB7bnVtYmVyfSAtIHRoZSBjdXJyZW50IGZyYW1lIGluZm8gaW5kZXguXG4gKi9cblNwcml0ZUFuaW1hdGlvblN0YXRlLnByb3RvdHlwZS5nZXRDdXJyZW50SW5kZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMudG90YWxGcmFtZXMgPiAxKSB7XG4gICAgICAgIC8vaW50IG9sZEZyYW1lID0gZnJhbWU7XG4gICAgICAgIHRoaXMuZnJhbWUgPSBNYXRoLmZsb29yKHRoaXMudGltZSAqIHRoaXMuY2xpcC5mcmFtZVJhdGUpO1xuICAgICAgICBpZiAodGhpcy5mcmFtZSA8IDApIHtcbiAgICAgICAgICAgIHRoaXMuZnJhbWUgPSAtdGhpcy5mcmFtZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB3cmFwcGVkSW5kZXg7XG4gICAgICAgIGlmICh0aGlzLndyYXBNb2RlICE9PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLlBpbmdQb25nKSB7XG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPSBfd3JhcCh0aGlzLmZyYW1lLCB0aGlzLnRvdGFsRnJhbWVzIC0gMSwgdGhpcy53cmFwTW9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggPSB0aGlzLmZyYW1lO1xuICAgICAgICAgICAgdmFyIGNudCA9IE1hdGguZmxvb3Iod3JhcHBlZEluZGV4IC8gdGhpcy50b3RhbEZyYW1lcyk7XG4gICAgICAgICAgICB3cmFwcGVkSW5kZXggJT0gdGhpcy50b3RhbEZyYW1lcztcbiAgICAgICAgICAgIGlmICgoY250ICYgMHgxKSA9PT0gMSkge1xuICAgICAgICAgICAgICAgIHdyYXBwZWRJbmRleCA9IHRoaXMudG90YWxGcmFtZXMgLSAxIC0gd3JhcHBlZEluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gdHJ5IHRvIHVzZSBjYWNoZWQgZnJhbWUgaW5mbyBpbmRleFxuICAgICAgICBpZiAodGhpcy5fY2FjaGVkSW5kZXggLSAxID49IDAgJiZcbiAgICAgICAgICAgIHdyYXBwZWRJbmRleCA+PSB0aGlzLl9mcmFtZUluZm9GcmFtZXNbdGhpcy5fY2FjaGVkSW5kZXggLSAxXSAmJlxuICAgICAgICAgICAgd3JhcHBlZEluZGV4IDwgdGhpcy5fZnJhbWVJbmZvRnJhbWVzW3RoaXMuX2NhY2hlZEluZGV4XSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlZEluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gc2VhcmNoIGZyYW1lIGluZm9cbiAgICAgICAgdmFyIGZyYW1lSW5mb0luZGV4ID0gX2JpbmFyeVNlYXJjaCh0aGlzLl9mcmFtZUluZm9GcmFtZXMsIHdyYXBwZWRJbmRleCArIDEpO1xuICAgICAgICBpZiAoZnJhbWVJbmZvSW5kZXggPCAwKSB7XG4gICAgICAgICAgICBmcmFtZUluZm9JbmRleCA9IH5mcmFtZUluZm9JbmRleDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9jYWNoZWRJbmRleCA9IGZyYW1lSW5mb0luZGV4O1xuICAgICAgICByZXR1cm4gZnJhbWVJbmZvSW5kZXg7XG4gICAgfVxuICAgIGVsc2UgaWYgKHRoaXMudG90YWxGcmFtZXMgPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFxuLy8vIEMjIEFycmF5LkJpbmFyeVNlYXJjaFxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFxuZnVuY3Rpb24gX2JpbmFyeVNlYXJjaCAoYXJyYXksIHZhbHVlKSB7XG4gICAgdmFyIGwgPSAwLCBoID0gYXJyYXkubGVuZ3RoIC0gMTtcbiAgICB3aGlsZSAobCA8PSBoKSB7XG4gICAgICAgIHZhciBtID0gKChsICsgaCkgPj4gMSk7XG4gICAgICAgIGlmIChhcnJheVttXSA9PT0gdmFsdWUpIHtcbiAgICAgICAgICAgIHJldHVybiBtO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhcnJheVttXSA+IHZhbHVlKSB7XG4gICAgICAgICAgICBoID0gbSAtIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBsID0gbSArIDE7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIH5sO1xufVxuXG5mdW5jdGlvbiBfd3JhcCAoX3ZhbHVlLCBfbWF4VmFsdWUsIF93cmFwTW9kZSkge1xuICAgIGlmIChfbWF4VmFsdWUgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIGlmIChfdmFsdWUgPCAwKSB7XG4gICAgICAgIF92YWx1ZSA9IC1fdmFsdWU7XG4gICAgfVxuICAgIGlmIChfd3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuTG9vcCkge1xuICAgICAgICByZXR1cm4gX3ZhbHVlICUgKF9tYXhWYWx1ZSArIDEpO1xuICAgIH1cbiAgICBlbHNlIGlmIChfd3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuUGluZ1BvbmcpIHtcbiAgICAgICAgdmFyIGNudCA9IE1hdGguZmxvb3IoX3ZhbHVlIC8gX21heFZhbHVlKTtcbiAgICAgICAgX3ZhbHVlICU9IF9tYXhWYWx1ZTtcbiAgICAgICAgaWYgKGNudCAlIDIgPT09IDEpIHtcbiAgICAgICAgICAgIHJldHVybiBfbWF4VmFsdWUgLSBfdmFsdWU7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChfdmFsdWUgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoX3ZhbHVlID4gX21heFZhbHVlKSB7XG4gICAgICAgICAgICByZXR1cm4gX21heFZhbHVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBfdmFsdWU7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gU3ByaXRlQW5pbWF0aW9uU3RhdGU7XG5cbkZpcmUuX1JGcG9wKCk7IiwiRmlyZS5fUkZwdXNoKCdzcHJpdGUtYW5pbWF0aW9uJyk7XG4vLyBzcHJpdGUtYW5pbWF0aW9uLmpzXG5cbnZhciBTcHJpdGVBbmltYXRpb25DbGlwID0gcmVxdWlyZSgnc3ByaXRlLWFuaW1hdGlvbi1jbGlwJyk7XG52YXIgU3ByaXRlQW5pbWF0aW9uU3RhdGUgPSByZXF1aXJlKCdzcHJpdGUtYW5pbWF0aW9uLXN0YXRlJyk7XG5cbi8vIOWumuS5ieS4gOS4quWQjeWPq1Nwcml0ZSBBbmltYXRpb24g57uE5Lu2XG52YXIgU3ByaXRlQW5pbWF0aW9uID0gRmlyZS5leHRlbmQoJ0ZpcmUuU3ByaXRlQW5pbWF0aW9uJywgRmlyZS5Db21wb25lbnQsIGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmFuaW1hdGlvbnMgPSBbXTtcbiAgICB0aGlzLl9uYW1lVG9TdGF0ZSA9IHt9O1xuICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IG51bGw7XG4gICAgdGhpcy5fc3ByaXRlUmVuZGVyZXIgPSBudWxsO1xuICAgIHRoaXMuX2RlZmF1bHRTcHJpdGUgPSBudWxsO1xuICAgIHRoaXMuX2xhc3RGcmFtZUluZGV4ID0gLTE7XG4gICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICB0aGlzLl9wbGF5U3RhcnRGcmFtZSA9IDA7Ly8g5Zyo6LCD55SoUGxheeeahOW9k+W4p+eahExhdGVVcGRhdGXkuI3ov5vooYxzdGVwXG59KTtcblxuRmlyZS5hZGRDb21wb25lbnRNZW51KFNwcml0ZUFuaW1hdGlvbiwgJ1Nwcml0ZSBBbmltYXRpb24nKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ2RlZmF1bHRBbmltYXRpb24nLCBudWxsICwgRmlyZS5PYmplY3RUeXBlKFNwcml0ZUFuaW1hdGlvbkNsaXApKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ2FuaW1hdGlvbnMnLCBbXSwgRmlyZS5PYmplY3RUeXBlKFNwcml0ZUFuaW1hdGlvbkNsaXApKTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3AoJ19wbGF5QXV0b21hdGljYWxseScsIHRydWUsIEZpcmUuSGlkZUluSW5zcGVjdG9yKTtcblNwcml0ZUFuaW1hdGlvbi5nZXRzZXQoJ3BsYXlBdXRvbWF0aWNhbGx5JyxcbiAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wbGF5QXV0b21hdGljYWxseTtcbiAgICB9LFxuICAgIGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLl9wbGF5QXV0b21hdGljYWxseSA9IHZhbHVlO1xuICAgIH1cbik7XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuZ2V0QW5pbVN0YXRlID0gZnVuY3Rpb24gKGFuaW1DbGlwKSB7XG5cbiAgICB0aGlzLl9zcHJpdGVSZW5kZXJlciA9IHRoaXMuZW50aXR5LmdldENvbXBvbmVudChGaXJlLlNwcml0ZVJlbmRlcmVyKTtcblxuICAgIHZhciBuZXdBbmltU3RhdGUgPSBuZXcgU3ByaXRlQW5pbWF0aW9uU3RhdGUoYW5pbUNsaXAubmFtZSwgYW5pbUNsaXApO1xuXG4gICAgcmV0dXJuIG5ld0FuaW1TdGF0ZTtcbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaW5pdGlhbGl6ZWQgPSAodGhpcy5uYW1lVG9TdGF0ZSAhPT0gbnVsbCk7XG4gICAgaWYgKGluaXRpYWxpemVkID09PSBmYWxzZSkge1xuICAgICAgICB0aGlzLnNwcml0ZV8gPSB0aGlzLmVudGl0eS5nZXRDb21wb25lbnQoRmlyZS5TcHJpdGUpO1xuICAgICAgICB0aGlzLl9kZWZhdWx0U3ByaXRlID0gc3ByaXRlXztcblxuICAgICAgICB0aGlzLm5hbWVUb1N0YXRlID0ge307XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5hbmltYXRpb25zLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgICB2YXIgY2xpcCA9IHRoaXMuYW5pbWF0aW9uc1tpXTtcbiAgICAgICAgICAgIGlmIChjbGlwICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIHN0YXRlID0gbmV3IFNwcml0ZUFuaW1hdGlvblN0YXRlKGNsaXApO1xuICAgICAgICAgICAgICAgIHRoaXMubmFtZVRvU3RhdGVbc3RhdGUubmFtZV0gPSBzdGF0ZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5kZWZhdWx0QW5pbWF0aW9uID09PSBjbGlwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY3VyQW5pbWF0aW9uID0gc3RhdGU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdEZyYW1lSW5kZXggPSAtMTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAoYW5pbVN0YXRlLCB0aW1lKSB7XG4gICAgdGhpcy5fY3VyQW5pbWF0aW9uID0gYW5pbVN0YXRlO1xuICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSAtMTtcbiAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aW1lO1xuICAgICAgICB0aGlzLl9wbGF5U3RhcnRGcmFtZSA9IEZpcmUuVGltZS5mcmFtZUNvdW50O1xuICAgICAgICB0aGlzLnNhbXBsZSgpO1xuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUub25Mb2FkID0gZnVuY3Rpb24gKCkge1xuICAgIGlmICh0aGlzLmVuYWJsZWQpIHtcbiAgICAgICAgaWYgKHRoaXMuX3BsYXlBdXRvbWF0aWNhbGx5ICYmIHRoaXMuZGVmYXVsdEFuaW1hdGlvbikge1xuICAgICAgICAgICAgdmFyIGFuaW1TdGF0ZSA9IHRoaXMuZ2V0QW5pbVN0YXRlKHRoaXMuZGVmYXVsdEFuaW1hdGlvbik7XG4gICAgICAgICAgICB0aGlzLnBsYXkoYW5pbVN0YXRlLCAwKTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblNwcml0ZUFuaW1hdGlvbi5wcm90b3R5cGUubGF0ZVVwZGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uICE9PSBudWxsICYmIEZpcmUuVGltZS5mcmFtZUNvdW50ID4gdGhpcy5fcGxheVN0YXJ0RnJhbWUpIHtcbiAgICAgICAgdmFyIGRlbHRhID0gRmlyZS5UaW1lLmRlbHRhVGltZSAqIHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZDtcbiAgICAgICAgdGhpcy5zdGVwKGRlbHRhKTtcbiAgICB9XG59O1xuXG5TcHJpdGVBbmltYXRpb24ucHJvdG90eXBlLnN0ZXAgPSBmdW5jdGlvbiAoZGVsdGFUaW1lKSB7XG4gICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24udGltZSArPSBkZWx0YVRpbWU7XG4gICAgICAgIHRoaXMuc2FtcGxlKCk7XG4gICAgICAgIHZhciBzdG9wID0gZmFsc2U7XG4gICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuT25jZSB8fFxuICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkRlZmF1bHQgfHxcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi53cmFwTW9kZSA9PT0gU3ByaXRlQW5pbWF0aW9uQ2xpcC5XcmFwTW9kZS5DbGFtcEZvcmV2ZXIpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24uc3BlZWQgPiAwICYmIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA+PSB0aGlzLl9jdXJBbmltYXRpb24udG90YWxGcmFtZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5fY3VyQW5pbWF0aW9uLndyYXBNb2RlID09PSBTcHJpdGVBbmltYXRpb25DbGlwLldyYXBNb2RlLkNsYW1wRm9yZXZlcikge1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IHRoaXMuX2N1ckFuaW1hdGlvbi50b3RhbEZyYW1lcztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgLyB0aGlzLl9jdXJBbmltYXRpb24uY2xpcC5mcmFtZVJhdGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzdG9wID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lID0gdGhpcy5fY3VyQW5pbWF0aW9uLnRvdGFsRnJhbWVzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbi5zcGVlZCA8IDAgJiYgdGhpcy5fY3VyQW5pbWF0aW9uLmZyYW1lIDwgMCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLl9jdXJBbmltYXRpb24ud3JhcE1vZGUgPT09IFNwcml0ZUFuaW1hdGlvbkNsaXAuV3JhcE1vZGUuQ2xhbXBGb3JldmVyKSB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3AgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyQW5pbWF0aW9uLnRpbWUgPSAwO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJBbmltYXRpb24uZnJhbWUgPSAwO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbi5mcmFtZSA9IDA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gZG8gc3RvcFxuICAgICAgICBpZiAoc3RvcCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKHRoaXMuX2N1ckFuaW1hdGlvbik7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5zYW1wbGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgaWYgKHRoaXMuX2N1ckFuaW1hdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICB2YXIgbmV3SW5kZXggPSB0aGlzLl9jdXJBbmltYXRpb24uZ2V0Q3VycmVudEluZGV4KCk7XG4gICAgICAgIGlmIChuZXdJbmRleCA+PSAwICYmIG5ld0luZGV4ICE9IHRoaXMuX2N1ckluZGV4KSB7XG4gICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGUgPSB0aGlzLl9jdXJBbmltYXRpb24uY2xpcC5mcmFtZUluZm9zW25ld0luZGV4XS5zcHJpdGU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fY3VySW5kZXggPSBuZXdJbmRleDtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMuX2N1ckluZGV4ID0gLTE7XG4gICAgfVxufTtcblxuU3ByaXRlQW5pbWF0aW9uLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24gKGFuaW1TdGF0ZSkge1xuICAgIGlmICggYW5pbVN0YXRlICE9PSBudWxsICkge1xuICAgICAgICBpZiAoYW5pbVN0YXRlID09PSB0aGlzLl9jdXJBbmltYXRpb24pIHtcbiAgICAgICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgYW5pbVN0YXRlLnRpbWUgPSAwO1xuXG4gICAgICAgIHZhciBzdG9wQWN0aW9uID0gYW5pbVN0YXRlLnN0b3BBY3Rpb247XG4gICAgICAgIHN3aXRjaCAoc3RvcEFjdGlvbikge1xuICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRG9Ob3RoaW5nOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uRGVmYXVsdFNwcml0ZTpcbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5zcHJpdGUgPSB0aGlzLl9kZWZhdWx0U3ByaXRlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBTcHJpdGVBbmltYXRpb25DbGlwLlN0b3BBY3Rpb24uSGlkZTpcbiAgICAgICAgICAgICAgICB0aGlzLl9zcHJpdGVSZW5kZXJlci5lbmFibGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFNwcml0ZUFuaW1hdGlvbkNsaXAuU3RvcEFjdGlvbi5EZXN0cm95OlxuXG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX2N1ckFuaW1hdGlvbiA9IG51bGw7XG4gICAgfVxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTcHJpdGVBbmltYXRpb247XG5cbkZpcmUuX1JGcG9wKCk7Il19
