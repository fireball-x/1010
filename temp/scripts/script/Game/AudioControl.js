Fire._RFpush('38f164e9c2b844baa46f0d4d7d7205dd', 'AudioControl');
// script/Game/AudioControl.js

var AudioControl = {};

AudioControl.play_finished = function () {
    var Audio_finished = Fire.Entity.find('/Audio/done');
    var audio = Audio_finished.getComponent(Fire.AudioSource);
    audio.play();
};

AudioControl.play_bobo = function () {
    var Audio_bobo = Fire.Entity.find('/Audio/bobo');
    var audio = Audio_bobo.getComponent(Fire.AudioSource);
    audio.play();
};

module.exports = AudioControl;

Fire._RFpop();