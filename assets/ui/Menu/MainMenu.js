var MainMenu = Fire.extend(Fire.Component);

MainMenu.prototype.onLoad = function(){
	var btnPlay = Fire.Entity.find("/btn_play");
	btnPlay.on("mouseup", function () {
	    Fire.Engine.loadScene("Game");
	}.bind(this));
};
