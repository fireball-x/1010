var Background = {};

Background.loadBackground = function() {
    var bg1 = Fire.Entity.find('/Bg-Image/bg');
    var bg2 = Fire.Entity.find('/Bg-Image/bg2');
    var bg3 = Fire.Entity.find('/Bg-Image/bg3');
    var bgimgs = [bg1,bg2,bg3];
    bgimgs[Math.floor(Math.random() * 3)].active = true;
    Fire.log('background');
};

module.exports = Background;