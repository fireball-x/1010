Fire._RFpush('cc304a3ca44e43488b9c400d9fab8945', 'Button');
// script/UI/Button.js

var Button = Fire.defineComponent(function () { 
	this._btnRender = null;
});

Button.prop('normal', null, Fire.ObjectType(Fire.Sprite));

Button.prop('hover', null, Fire.ObjectType(Fire.Sprite));

Button.prop('pressed', null, Fire.ObjectType(Fire.Sprite));

Button.prop('disabled', null, Fire.ObjectType(Fire.Sprite));

Button.prototype.onLoad = function () {

    this._btnRender = this.entity.getComponent(Fire.SpriteRenderer);
    
    this._btnRender.sprite = this.normal;
    
    this.entity.on('mousedown', function () {
        this._btnRender.sprite = this.pressed;
    }.bind(this));

    this.entity.on('mouseup', function () {
        this._btnRender.sprite = this.normal;
    }.bind(this));

};

Fire._RFpop();