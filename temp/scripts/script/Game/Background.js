Fire._RFpush('3f84586b6cee4e6ca5d46cfd6ba8498a', 'Background');
// script\Game\Background.js

var Background = Fire.defineComponent();

Background.prop('backGroups', [], Fire.ObjectType(Fire.Sprite));

Background.prototype.onLoad = function() {
    var bgSprite = this.backGroups[Math.randomRangeInt(0, this.backGroups.length)];
    
    var render = this.entity.getComponent(Fire.SpriteRenderer);
    render.sprite = bgSprite;
};

module.exports = Background;

Fire._RFpop();