# tacz 赛博军械师枪包还原2077效果的kubejs脚本

## 说明

游戏版本：1.20.1 forge
基本必须mod：tacz, 赛博军械师枪包, kubejs（废话

### 应龙(需要同时安装了铁魔法mod)

#### 效果描述

还原了概率释放电磁脉冲的效果，具体释放的效果为铁魔法的shockwave(冲击波)法术
需要持有附魔了time_slow 的破军附魔才能生效，法术等级和法强根据附魔等级提升，具体计算见源码

#### 使用

将`gun_spells_yinlong.js`和`gun_spells_damage_attribution.js`文件放到`kubejs/server_scripts`文件夹下
第一个文件是应龙的效果实现，第二个是伤害来源修正到玩家
一个我的路径的例子：`1.20.1\.minecraft\versions\落幕曲\kubejs\server_scripts`

之后可能提供快捷修改附魔，法术等级，法强的脚本