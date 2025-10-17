// 注册枪械换弹事件
TimelessGunEvents.gunReload((event) => {
  // 获取事件中的玩家实体
  const player = event.getEntity();
  // 获取玩家主手上的物品
  const mainHandItem = player.getMainHandItem();
  // 获取指定的附魔：破军
  const enchantmentId = 'time_slow:armor_piercing';
  const enchantments = mainHandItem.getEnchantments();
  let foundEnchantmentLevel = 0;

  // --- 枪械检测 ---
  // 检查玩家手持物品是否为指定的枪 (tacz:modern_kinetic_gun)
  // 并且检查其NBT数据中的GunId是否为 "cyber_armorer:3516"
  // 检查是否附魔了指定的破军附魔
  if (
    mainHandItem.id === 'tacz:modern_kinetic_gun' &&
    mainHandItem.nbt &&
    mainHandItem.nbt.GunId === 'cyber_armorer:3516' &&
    enchantments.containsKey(enchantmentId)
  ) {
    // 如果检测通过，则执行后续的粒子和声音效果
    const level = player.level;
    // 读取附魔等级
    foundEnchantmentLevel = enchantments.get(enchantmentId);
    // --- 调试点 ---
    // player.tell('§e[调试] §a所有检查通过: §f枪械、NBT和附魔均正确。正在执行换弹效果...');

    // --- 【修复】明确加载 Minecraft 的 AABB 类 ---
    // 这样可以确保无论在何种脚本环境下, 'AABB' 都是可用的。
    const AABB = Java.loadClass('net.minecraft.world.phys.AABB');
    // --- 扇形效果参数 (可在此处自定义) ---
    const particleType = 'minecraft:flame'; // 粒子效果类型
    const distance = 3; // 效果中心距离玩家的距离
    const spreadWidth = 4; // 扇面的宽度
    const spreadDepth = 4; // 扇面的深度/厚度
    const verticalSpread = 2; // 垂直方向的扩散范围
    const particleCount = 300; // 粒子数量，数量越多效果越浓密
    const particleSpeed = 0.01; // 粒子初始速度
    // 伤害与燃烧效果参数
    const damageTotal = 50 + foundEnchantmentLevel * 30; // 总伤害, 基础30，每级附魔增加10点伤害
    const fireDuration = 5; // 燃烧的持续时间 (单位：秒)

    // 获取玩家的视线向量 (已经标准化，长度为1)
    const look = player.getLookAngle();

    // 计算效果的中心点位置
    const centerX = player.x + look.x() * distance;
    const centerY = player.y + player.getEyeHeight(); // 从玩家眼睛的高度开始
    const centerZ = player.z + look.z() * distance;

    // 计算一个能包裹住旋转后矩形的、与世界坐标轴对齐的扩散框
    const dX =
      Math.abs(look.z() * spreadWidth) + Math.abs(look.x() * spreadDepth);
    const dZ =
      Math.abs(look.x() * spreadWidth) + Math.abs(look.z() * spreadDepth);
    const halfDX = dX / 2;
    const halfDY = verticalSpread / 2;
    const halfDZ = dZ / 2;
    // 生成火焰粒子
    // 注意：dX, dY, dZ 是指以中心点为基准，在各个轴上扩散的“半径”
    level.spawnParticles(
      particleType,
      true, // 强制显示
      centerX,
      centerY,
      centerZ,
      dX / 2, // X轴扩散范围
      verticalSpread / 2, // Y轴扩散范围
      dZ / 2, // Z轴扩散范围
      particleCount,
      particleSpeed
    );
    // --- 2. 范围伤害与点燃效果 ---
    // 创建一个与粒子范围完全匹配的轴对齐边界框 (AABB)
    const aabb = new AABB(
      centerX - halfDX,
      centerY - halfDY,
      centerZ - halfDZ,
      centerX + halfDX,
      centerY + halfDY,
      centerZ + halfDZ
    );

    // 获取该边界框内的所有实体
    const entitiesInArea = level.getEntitiesWithin(aabb);
    player.tell(
      '§e[调试] §a触发换弹效果，范围内实体数量: §f' + entitiesInArea.size()
    );

    // 遍历找到的所有实体
    for (const entity of entitiesInArea) {
      player.tell('§e[调试] §a处理实体: §f' + entity.getDisplayName().string);
      if (entity.isLiving() && entity.id !== player.id) {
        player.tell(
          '§e[调试] §a对实体造成伤害并点燃: §f' + entity.getDisplayName().string
        );
        // 点燃实体
        // 将秒转换为游戏刻 (1秒 = 20刻)
        const fireDurationInTicks = fireDuration * 20;
        entity.mergeNbt({ Fire: fireDurationInTicks });
        entity.attack(player.damageSources().playerAttack(player),damageTotal);
      }
    }

    // 播放火焰声音，重复10次增大音量
    for (let i = 0; i < 10; i++) {
      level.playSound(
        null, // source: 在所有客户端播放
        player.x, // x
        player.y, // y
        player.z, // z
        'entity.blaze.shoot', // sound event id: 烈焰人射击音效
        'players', // category: 播放给玩家
        1.0, // 可被听到的距离
        1.0 // pitch: 音高
      );
    }
  } else {
    // 检测未通过
    return;
  }
});
