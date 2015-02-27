Fire._RFpush('e0ac2b810a73466d9f305d401ca23234', 'Toggle');
// script/UI/Toggle.js

var Toggle = Fire.defineComponent(function () { 
	this._btnRender = null;
    this._tiggle = false;
});

Toggle.prop('normal', null, Fire.ObjectType(Fire.Sprite));

Toggle.prop('pressed', null, Fire.ObjectType(Fire.Sprite));

Toggle.prototype.onLoad = function () {

    this._btnRender = this.entity.getComponent(Fire.SpriteRenderer);
    
    this._btnRender.sprite = this.normal;
    
    this.entity.on('mousedown', function () {
        this._tiggle = !this._tiggle;
        if(this._tiggle) {
	        this._btnRender.sprite = this.pressed;
        }
        else{
	        this._btnRender.sprite = this.normal;
        }
    }.bind(this));
};

Fire._RFpop();