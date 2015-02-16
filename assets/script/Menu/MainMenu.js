var MainMenu = Fire.defineComponent(function(){
    this._btnPlay = null;
});

//MainMenu.prop('')

MainMenu.prototype.onLoad = function(){
	this._btnPlay = Fire.Entity.find("/btn_play");

	this._btnPlay.on("mouseup", function () {
	    Fire.Engine.loadScene("be073680-7270-41f2-a043-b3658ec77ee7");
	});
};
