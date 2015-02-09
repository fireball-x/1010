var Cell = Fire.defineComponent(function () {
    this._tempGrid = null;
    this._gridList = [];
});

Cell.prop("count", new Vec2(10, 10));

Cell.prop("size", new Vec2(30, 30));

Cell.prop("spacing", 2, Fire.Integer);

Cell.prop("_create", false, Fire.HideInInspector);

Cell.getset('create',
    function () {
        return this._create;
    },
    function (value) {
        if (value !== this._create) {
            this._create = value;
            if (this._create) {
                this.createBoard();
            }
            else {
                this.destroyBoard();
            }
        }
    });

Cell.prototype.createBoard = function () {
    this._gridList = [];
    if (!this._tempGrid) {
        this._tempGrid = this.entity.find('../Prefabs/Cube');
    }
    for (var x = 0, len = this.count.x; x < len; ++x) {
        this._gridList[x] = [];
        for (var y = 0, len = this.count.y; y < len; ++y) {
            var entity = Fire.instantiate(this._tempGrid);
            entity.parent = this.entity;
            entity.name = x + ":" + y;
            var widthX = (this.size.x + this.spacing);
            var widthY = (this.size.y + this.spacing);
            var startPosX = ((widthX * this.count.x) / 2) - (this.size.x / 2);
            var startPosY = ((widthY * this.count.y) / 2) - (this.size.y / 2);
            entity.transform.position = new Vec2(-startPosX + x * widthX, startPosY - y * widthY);
            var renderer = entity.getComponent(Fire.SpriteRenderer);
            renderer.color = new Fire.Color(85 / 255, 85 / 255, 85 / 255, 1);
            this._gridList[x][y] = entity;
        }
    }
};

Cell.prototype.destroyBoard = function () {
    var len = this._gridList.length;
    for (var x = 0; x < len; ++x) {
        for (var y = 0; y < len; ++y) {
            this._gridList[x][y].destroy();
        }
    }
    this._gridList.length = 0;
};

Cell.prototype.onLoad = function () {
    //     this.entity.on('mousedown',function(event) {
    //           console.log(event);
    //     });
};
