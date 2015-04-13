var CubeGroupManager = Fire.Class({
    // 继承
    extends: Fire.Component,
    // 构造函数
    constructor: function () {
        this._camera = null;
        this._hasCreateCubeGroup = false;
        this._isMouseUp = true;
        this._moveCubeGroup = null;
        this._playAnimation = false;
        // 定义获取输入事件的回调方法，保存到变量以便之后反注册
        this.bindedGlobalMouseMoveEvent = this._globalMouseMoveEvent.bind(this);
        this.bindedGlobalMouseUpEvent = this._globalMouseUpEvent.bind(this);
        this.bindedMouseDownEvent = this._mouseDownEvent.bind(this);
        this.bindedMouseUpEvent = this._mouseUpEvent.bind(this);

    },
    // 属性
    properties: {
        // 模板
        tempGrid: {
            default: null,
            type: Fire.Entity
        },
        // 每个Cube的大小
        cuebeSize: 32,
        //
        createOrClean: {
            get: function () {
                this._hasCreateCubeGroup = this.cubeGroupList.length > 0;
                return this._hasCreateCubeGroup;
            },
            set: function (value) {
                if (value != this._hasCreateCubeGroup) {
                    this._hasCreateCubeGroup = value;
                    if (this._hasCreateCubeGroup) {
                        this.create3(this.tempGrid, this.cuebeSize);
                    }
                    else {
                        this._clear();
                    }
                }
            }
        },
        audio_bobo: {
            default: null,
            type: Fire.AudioSource
        },
        cubeGroupList: {
            get: function () {
                return this.entity.getChildren();
            },
            visible: false
        }
    },
    //
    start: function () {
        //
        var mainCamera = Fire.Entity.find("/Main Camera");
        this._camera = mainCamera.getComponent(Fire.Camera);
        // 事件绑定
        Fire.Input.on('mousemove', this.bindedGlobalMouseMoveEvent);
        Fire.Input.on('mouseup', this.bindedGlobalMouseUpEvent);
    },
    onDestroy: function () {
        Fire.Input.off('mousemove', this.bindedGlobalMouseMoveEvent);
        Fire.Input.off('mouseup', this.bindedGlobalMouseUpEvent);
    },
    update: function () {
        if (this._playAnimation) {
            // CubeGroup出现动画
            this.entity.transform.scaleX += Fire.Time.deltaTime * 2;
            this.entity.transform.scaleY += Fire.Time.deltaTime * 2;
            if (this.entity.transform.scaleX >= 1 || this.entity.transform.scaleY >= 1) {
                this.entity.transform.scale = new Fire.Vec2(1, 1);
                this._playAnimation = false;
            }
        }
    },
    // 生成3个随机cubegroup并排列到指定位置
    create3: function (size) {
        var cubeGroupList = [];
        for (var i = 0; i < 3; i++) {
            var entity = new Fire.Entity('CubeGroup');
            entity.parent = this.entity;
            var cubeGroup = entity.addComponent('CubeGroup');
            cubeGroup.create(this.tempGrid, i, size);
            entity.on('mousedown', this.bindedMouseDownEvent);
            entity.on('mouseup', this.bindedMouseUpEvent);
            cubeGroupList.push(entity);
        }
        this.entity.transform.scale = new Fire.Vec2(0, 0);
        this._playAnimation = true;
        return cubeGroupList;
    },
    // 清除
    _clear: function () {
        var groupList = this.cubeGroupList;
        for(var i = 0,len = groupList.length; i < len; ++i) {
            groupList[i].destroy();
        }
        if (!Fire.Engine.isPlaying) {
            Fire.FObject._deferredDestroy();
        }
        this._hasCreateCubeGroup = false;
    },
    // 重置
    _reset: function () {
        this._isMouseUp = true;
        this._moveCubeGroup = null;
    },
    // 如果move过程中不允许put on,则复原cubegroup的原始位置
    _resetPosition: function (currentGroup) {
        var contains = this.cubeGroupList.some(function (ent) {
            return ent.getComponent('CubeGroup') === currentGroup;
        });
        if (contains) {
            currentGroup.reset();
        }
    },
    // 移动
    _move: function (camera, screenPosition, moveCubeGroup, moveYcount) {
        var wordPostion = camera.screenToWorld(screenPosition);
        var posX = wordPostion.x + this.transform.x;
        var posY = wordPostion.y - this.transform.y;
        if (Fire.Input.hasTouch) {
            var posY = wordPostion.y - this.transform.y + (moveYcount + 1) * 30 * 0.9;
        }
        moveCubeGroup.transform.position = new Fire.Vec2(posX, wordPostion.y - this.transform.y);
    },
    // 鼠标点击GridGroup事件
    _mouseDownEvent: function (event) {
        var target = event.target.parent;
        if(!target) {
            return;
        }
        var cubeGroup = target.getComponent('CubeGroup');
        if(!cubeGroup) {
            return;
        }
        this._isMouseUp = false;
        this._moveCubeGroup = cubeGroup;
        this._moveCubeGroup.transform.scale = new Fire.Vec2(0.9, 0.9);
        if (Fire.Input.hasTouch) {
            this._moveCubeGroup.transform.y = this._moveCubeGroup.transform.position.y + (cubeGroup.moveYcount + 1) * 30 * 0.9;
        }
    },
    // 鼠标松开GridGroup事件
    _mouseUpEvent: function () {
        this._reset();
    },
    // 全局鼠标移动事件
    _globalMouseMoveEvent: function (event) {
        if (!this._isMouseUp) {
            var screendPos = new Fire.Vec2(event.screenX, event.screenY);
            this._move(this._camera, screendPos, this._moveCubeGroup, this._moveCubeGroup.moveYcount);
        }
    },
    // 全局鼠标松开
    _globalMouseUpEvent: function (event) {
        if(!this._moveCubeGroup) {
            return;
        }
        var Game = require('Game');
        var canPut = Game.instance.putBoard(this._moveCubeGroup.entity);
        if (!canPut) {
            this._resetPosition(this._moveCubeGroup);
        }
        else {
            this._moveCubeGroup.destroy();
        }
        // 声音播放
        this.audio_bobo.play();
        this._reset();
    }
});
