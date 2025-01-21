# 这是什么

这是一个1.20.1 kubejs用的文件，是对于该[mod](https://github.com/DancingSnow0517/Minecraft-DG-LAB)的个人使用的一个脚本

## 使用

放到：`.minecraft\kubejs\server_scripts`
如果启动器开了版本隔离一般是：`.minecraft\versions\AFoP\kubejs\server_scripts`

## 行为

### 受伤时

在玩家受伤时，根据受到的伤害数值，相对于玩家最大生命值的比例来设置强度
在受伤害后立刻设置对应强度，随后写入1s的恒定波形

> 比如最大生命值100，受到30点伤害则强度为30，伤害为5则强度5
> 计算部分就是：damagePercent = damage / maxHealth;

### 死亡时

最大强度3s

> 就是这两句，第一大块里面的
> connection.setStrength('a', AMaxStrength);
> connection.setStrength('b', BMaxStrength);