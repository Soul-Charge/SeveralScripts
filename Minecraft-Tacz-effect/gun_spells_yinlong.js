// 应龙 - 概率释放电磁脉冲
EntityEvents.hurt((event) => {
  const { entity, source, server } = event;
  const actualSource = source.getActual(); // 使用 getActual() 更为稳妥

  // 确保攻击源是玩家
  if (!actualSource || !actualSource.isPlayer()) {
    return;
  }
  const player = actualSource;
  // player.tell(NBT.intArrayTag(uuidToIntArray(player.getUuid().toString())));

  // 1. 检查主手物品ID
  const mainHandItem = player.getMainHandItem();
  if (mainHandItem.id !== 'tacz:modern_kinetic_gun') {
    return;
  }

  // 2. 检查枪械的特定NBT数据
  if (mainHandItem.nbt?.GunId !== 'cyber_armorer:g58_dian_yinglong') {
    return;
  }

  // 3. 确保目标不是玩家
  if (entity.isPlayer()) {
    return;
  }

  // 4. 检查并获取所需附魔
  const enchantmentId = 'time_slow:armor_piercing';
  const enchantments = mainHandItem.getEnchantments();
  let foundEnchantmentLevel = 0;

  // 从附魔映射中直接获取等级，效率更高
  if (enchantments.containsKey(enchantmentId)) {
    foundEnchantmentLevel = enchantments.get(enchantmentId);
  } else {
    // 如果找不到附魔，则直接退出
    return;
  }

  // --- 调试点 ---
  // player.tell('§e[调试] §a所有检查通过: §f枪械、NBT、目标和附魔均正确。正在执行法术...');

  // 法术设置相关
  let randomNum = Math.random();
  let probability = 0.02 + 0.003 * foundEnchantmentLevel; // 基础2%，每级附魔增加1%，0.02是因为一般一颗子弹判定三次
  const spellLevel = Math.max(1, foundEnchantmentLevel / 2); // 确保法术等级至少为1, 每两级附魔提升一级法术等级
  const spellPower = 1.0 + 0.3 * foundEnchantmentLevel; // 法术强度，基础1.0，每级附魔增加0.5
  const spellId = 'shockwave'; // 法术ID

  // 生成傀儡相关
  const level = entity.level;
  const entityX = entity.getX();
  const entityY = entity.getY();
  const entityZ = entity.getZ();
  const puppetTag = 'kubejs_spell_caster_puppet'; // 傀儡标签
  const puppet = level.createEntity('minecraft:armor_stand');
  const teamName = 'gun_spell_allies'; // 团队名
  // 设置傀儡属性
  puppet.setPosition(entityX, entityY, entityZ);
  puppet.addTag(puppetTag);
  puppet.setInvulnerable(true); // 无敌
  puppet.setNoGravity(true); // 无重力
  puppet.setInvisible(true); // 隐形
  puppet.persistentData.putString('casterUUID', player.getUuid().toString()); // 存储施法者UUID
  puppet.mergeNbt({Attributes:[{Base:spellPower, Name:"irons_spellbooks:spell_power"}]}); // 修改法强

  // 傀儡施法指令
  const castCommand = `execute as @e[type=minecraft:armor_stand,tag=${puppetTag},limit=1] at @s run cast @s ${spellId} ${spellLevel}`;
  // 清理指令
  const KillCommand = `kill @e[type=minecraft:armor_stand,tag=${puppetTag}]`;
  // 队伍加入指令
  const teamJoinCommand = `execute as @e[type=minecraft:armor_stand,tag=${puppetTag},limit=1] run team join ${teamName} @s`;

  // 6.66% 概率触发
  if (randomNum <= probability) {
    // player.tell('§e[调试] §a随机数: §f' + randomNum + ' §a，触发法术！');

    // 生成施法傀儡
    puppet.spawn();
    // 让刚刚生成的傀儡加入队伍
    server.runCommandSilent(teamJoinCommand);

    // 召唤实体后延迟1tick
    server.schedule(1, () => {

      // 让傀儡施法
      server.runCommandSilent(castCommand);
      // 延迟 20 游戏刻执行清理操作，确保法术有足够时间完成
      server.schedule(10, () => {
        server.runCommandSilent(KillCommand);
      });
    });
  } else {
    // player.tell('§e[调试] §a随机数: §f' + randomNum + ' §c，未触发法术。');
  }
});
