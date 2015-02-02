# 1010
A 1010! clone made with Fireball Game Engine, find the original game here: https://itunes.apple.com/us/app/1010!/id911793120?mt=8

## 运行项目

使用 Fireball dashboard 打开项目。

## 游戏介绍

玩家在10x10的格子棋盘里放置由1格到9格组成的形状，任意一行或一列放满就会消去。每次会随机出现3个形状让玩家放置，3个形状全部放置进棋盘后就会出现3个新的形状。当玩家无法把3个形状全部放进棋盘时就会 gameover。

形状一共有以下9种：
<pre>
x xx xxx xxxx xxxxxx

x   xx   
xx  xx

xxx xxx
x   xxx
x   xxx
</pre>

每种形状有独特的颜色，非对称的形状有可能以不同的方向出现，比如：
<pre>
x   xx
xx   x
</pre>
是同一种形状的不同方向，玩家不能手动切换形状的方向。

随着玩家分数提高，出现包含更多方块的形状的几率会逐渐提升。

## 开发要求

- 基本玩法实现
- 消除效果实现
- 随机出形状算法实现
- 难度提升算法实现
- 菜单循环实现
- 重构，要求代码清晰明确，可以作为初学者的参考
- 书写教程文档
- 积分榜实现（使用 Meteor）


 
