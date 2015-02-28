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
