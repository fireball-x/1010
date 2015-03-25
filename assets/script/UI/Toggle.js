var Toggle = Fire.extend(Fire.Component, function () { 
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
