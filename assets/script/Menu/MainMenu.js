var MainMenu = Fire.defineComponent(function(){
    this._btnPlay = null;
});

//MainMenu.prop('')

MainMenu.prototype.onLoad = function(){
	this._btnPlay = Fire.Entity.find("/btn_play");

	this._btnPlay.on("mouseup", function () {
	    Fire.Engine.loadScene("de895751-2fef-47bf-8cd8-024ad8e3778d");
	});
};
