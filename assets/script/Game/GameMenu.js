var AudioControl = require('AudioControl');

var GameMenu = Fire.defineComponent(function() {
    this.soundMute = false;
});

GameMenu.prototype.onLoad = function () {

    this.mainMenuScene = "MainMenu";
    this.gameScene = "Game";
    this.menu = Fire.Entity.find('/Menu');

    var btn_Menu = Fire.Entity.find("/Button/btn_Menu");
    btn_Menu.on("mouseup", function () {
        this.menu.active = true;
    }.bind(this));

    var btn_Continue = Fire.Entity.find('/Menu/btn_Continue');
    btn_Continue.on("mouseup", function () {
        this.menu.active = false
    }.bind(this));

    var btn_Restart = Fire.Entity.find('/Menu/btn_Restart');
    btn_Restart.on("mouseup", function () {
        Fire.Engine.loadScene(this.gameScene);
    }.bind(this));

    var btn_Home = Fire.Entity.find('/Menu/btn_Home');
    btn_Home.on("mouseup", function () {
        Fire.Engine.loadScene(this.mainMenuScene);
    }.bind(this));

    var btn_sound = Fire.Entity.find('/Menu/sound/slider_slot');
    var btn_sound_off = Fire.Entity.find('/Menu/sound/slider_slot/button_empty_01');
    var btn_sound_on = Fire.Entity.find('/Menu/sound/slider_slot/button_empty_03');
    btn_sound.on('mouseup',function(){
        if(this.soundMute){
			btn_sound_off.active = false;
            btn_sound_on.active = true;
        }
        else{
            btn_sound_off.active = true;
			btn_sound_on.active = false;
        }
        this.soundMute = !this.soundMute;
        AudioControl.isMute(this.soundMute);

    }.bind(this));

    var gameOverRestart = Fire.Entity.find("/GameOver/btn_Restart");
    gameOverRestart.on('mouseup',function () {
       Fire.Engine.loadScene(this.gameScene);
    }.bind(this));

    var gameOverHome = Fire.Entity.find("/GameOver/btn_Home");
    gameOverHome.on('mouseup',function () {
       Fire.Engine.loadScene(this.mainMenuScene);
    }.bind(this));
};
