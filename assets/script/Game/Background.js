var Background = Fire.defineComponent();

Background.prop('backGroups', [], Fire.ObjectType(Fire.Sprite));

Background.prototype.onLoad = function() {
    var bgSprite = this.backGroups[Math.randomRangeInt(0, this.backGroups.length)];
    
    var render = this.entity.getComponent(Fire.SpriteRenderer);
    render.sprite = bgSprite;
};

module.exports = Background;