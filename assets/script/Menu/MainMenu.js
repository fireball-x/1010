var MainMenu = Fire.defineComponent(function(){
    
});

//MainMenu.prop('')

MainMenu.prototype.onLoad = function(){

    this.gameUUID = "e958312b-03e3-4a03-a2fe-6e7f40f634d6";
    
	var btnPlay = Fire.Entity.find("/btn_play");
	btnPlay.on("mouseup", function () {
	    Fire.Engine.loadScene(this.gameUUID);
	}.bind(this));
    
};
