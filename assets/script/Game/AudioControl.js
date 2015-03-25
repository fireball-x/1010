// 音乐控制类
var AudioControl = {};

AudioControl.play_finished = function() {
    var Audio_finished = Fire.Entity.find('/Audio/done');
    var audio = Audio_finished.getComponent(Fire.AudioSource);
    audio.play();
};

AudioControl.play_bobo = function() {
    var Audio_bobo = Fire.Entity.find('/Audio/bobo');
    var audio = Audio_bobo.getComponent(Fire.AudioSource);
    audio.play();
};

// 是否静音
AudioControl.isMute = function(value) {
    var Audio_finished = Fire.Entity.find('/Audio/done');
    var Audio_bobo = Fire.Entity.find('/Audio/bobo');
    var Audio_bg = Fire.Entity.find('/Audio/bg');
    var audios = [];
    audios.push(Audio_finished);
    audios.push(Audio_bobo);
    audios.push(Audio_bg);
    for (var i = 0; i < audios.length; i++) {
        var tempAudio = audios[i].getComponent(Fire.AudioSource);
        tempAudio.mute = value;
    }
};

module.exports = AudioControl;