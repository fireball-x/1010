Fire._RFpush('3b001d5dcf804a858845506ff1189082', 'MainMenu');
// script\Menu\MainMenu.js

var MainMenu = Fire.defineComponent(function(){
    this._btnPlay = null;
});

MainMenu.prototype.onStart = function(){
    if(!this._btnPlay){
    	this._btnPlay = this.entity.find("btn_play");
        this._btnPlay.on("mousedown",function(){
            Fire.Engine.loadScene("3dc05f12-2d68-416f-a676-505a1a5f7d87");
        });
    }
};


Fire._RFpop();