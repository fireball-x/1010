var Button = Fire.extend(Fire.Component, function () { 
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

module.exports = Button;
