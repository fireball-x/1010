Fire._RFpush('6634f146f45a4791a3ab864e29497a89', 'GameMenu');
// script\Game\GameMenu.js

var GameMenu = Fire.defineComponent(function() {
});

GameMenu.prototype.onLoad = function () {

    this.homeUUID = "e41bbde0-cee8-475f-b96c-169db4f6d69d";
    this.gameUUID = "e958312b-03e3-4a03-a2fe-6e7f40f634d6";
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
        Fire.Engine.loadScene(this.gameUUID);
    }.bind(this));

    var btn_Home = Fire.Entity.find('/Menu/btn_Home');
    btn_Home.on("mouseup", function () {
        Fire.Engine.loadScene(this.homeUUID);
    }.bind(this));

    var gameOverRestart = Fire.Entity.find("/GameOver/btn_Restart");
    gameOverRestart.on('mouseup',function () {
       Fire.Engine.loadScene(this.gameUUID);
    });
    
    var gameOverHome = Fire.Entity.find("/GameOver/btn_Home");
    gameOverHome.on('mouseup',function () {
       Fire.Engine.loadScene(this.homeUUID);
    }.bind(this));
};

Fire._RFpop();