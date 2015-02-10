Fire._RFpush('1df51c89d61843e48b1aadae86ec366a', 'MainMenu');
// script/Menu/MainMenu.js

var MainMenu = Fire.defineComponent(function(){
    this._btnPlay = null;
    this._btnPlayRender = null;
});

// MainMenu.prop('')

MainMenu.prototype.onLoad = function(){
	this._btnPlay = this.entity.find("btn_play");
    this._btnPlayRender = this._btnPlay.getComponent(Fire.SpriteRenderer);
};

MainMenu.prototype.onStart = function(){
    if(!this._btnPlay){
        this._btnPlay.on("mousedown",function(){
// //             this._btnPlayRender.sprite = 
        });
     	this._btnPlay.on("mouseup",function(){
// 			//Fire.Engine.loadScene("3dc05f12-2d68-416f-a676-505a1a5f7d87");
		});
    }
};


Fire._RFpop();