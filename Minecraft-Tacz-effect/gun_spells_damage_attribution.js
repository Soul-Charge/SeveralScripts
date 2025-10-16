/** 将枪械法术的伤害重设为来自玩家
 * 监听实体受伤事件。
 * 如果伤害来源于带有 'kubejs_spell_caster_puppet' 标签的盔甲架，
 * 则读取其 persistentData 中的 'casterUUID'，并将伤害来源重定向到对应的玩家。
 */
EntityEvents.hurt((event) => {
  const { entity, source, server, damage } = event;
  // 1. 检查伤害类型是否是shockwave造成的。
  if (source.getType() !== 'lightning_magic') {
    return; // 立即退出
  }

  // 2. 定义一个搜索范围。
  // 这个范围应该略大于法术的最大影响范围。单位是格（米）。
  const searchRadius = 50.0;
  const searchBox = entity.getBoundingBox().inflate(searchRadius);

  // 3. 在定义的范围内，寻找所有符合条件的施法傀儡。
  // 3.1 在范围内获取所有实体。
  const nerbyEntitys = entity.level.getEntitiesWithin(searchBox);
  // 3.2 如果没有找到任何实体，则退出。
  if (nerbyEntitys.length === 0) {
    return;
  }
  // 3.3: 遍历所有实体，进行筛选。
  const puppets = [];
  for (const entityInBox of nerbyEntitys) {
    // 调试信息，查看当前遍历的实体
    // server.tell('§e[调试] §a当前遍历实体:' + entityInBox);
    // server.tell('§e[调试] §a类型: ' + entityInBox.getType());
    // server.tell('§e[调试] §a标签: ' + entityInBox.getTags());
    if (
      entityInBox.getType() === 'minecraft:armor_stand' &&
      entityInBox.getTags().toString() === '[kubejs_spell_caster_puppet]' // 把getTags()转为字符串再比较，不然类型不同不匹配
    ) {
      // server.tell('§e[调试] §b找到符合条件的傀儡: ' + entityInBox);
      // 如果实体是盔甲架并且有我们的标签，就将它加入到结果数组中。
      puppets.push(entityInBox);
    }
  }
  // 3.4 如果没有找到任何傀儡，则退出。
  if (puppets.length === 0) {
    return;
  }
  // server.tell('§e[调试] §d所有符合条件的傀儡: ' + puppets);

  // 3.5 处理找到的傀儡，多个傀儡的情况少见，由于本身傀儡存在时间极短，所以这里不展开处理，直接取第一个。
  let puppet = puppets[0];

  // 4. 从最近的傀儡身上读取施法者UUID。
  const casterUUID = puppet.persistentData.getString('casterUUID');
  if (!casterUUID) {
    return; // 傀儡身上没有UUID数据，退出。
  }
  // server.tell('§e[调试] §a找到施法者UUID: ' + casterUUID);

  // 5. 根据UUID找到玩家。
  const ownerPlayer = server.getPlayer(casterUUID);
  // server.tell('§e[调试] §a找到的玩家: ' + ownerPlayer);

  // 8. 如果玩家在线，则替换伤害来源。
  if (ownerPlayer) {
    // 调试信息，确认脚本运行到了最后一步
    // ownerPlayer.tell(
      // '§b[归因系统] §f开始将法术伤害归于' +
        // ownerPlayer.getName() +
        // '伤害值为:' +
        // damage
    // );
    server.schedule(1, () => {
      // 取消原始的魔法伤害事件
      // server.tell('§e[调试] §a原始伤害事件已取消。');
      // 以玩家的名义，对目标造成一次等量的、新的伤害
      entity.attack(ownerPlayer.damageSources().playerAttack(ownerPlayer), damage);
      // ownerPlayer.tell(
        // '§b[归因系统] §f成功将法术伤害归于' +
          // ownerPlayer.username +
          // '伤害数值: ' +
          // damage
      // );
    });
    event.cancel(); // 取消原始的伤害事件
  }
});
