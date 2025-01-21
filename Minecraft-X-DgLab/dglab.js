// More event see https://wiki.latvian.dev/books/kubejs/page/list-of-events

/**
 * 最大强度
 * 事件：受伤时（实现）
 * * 计算收到的伤害对于最大生命值的百分比：伤害 / 最大生命值
 * * 将百分比，根据最大强度值，转换为强度值：百分比 * 最大强度值
 * 事件：死亡时
 * * 最大强度3秒
 * 事件：生命值未满时（未实现）
 * * 计算当前生命值下的负伤值：最大生命值 - 当前生命值
 * * 将负伤值，根据最大强度值，转换为强度值：
 */

// Death event for 'player'
EntityEvents.death('player', event => {
  // Use the player's UUID to find the connected connection
  let connection = DgLabManager.getByUUID(event.getEntity().getUuid())

  // If it's not null, it means the player's DgLab (郊狼) is connected to the server
  if (connection != null) {
    // Get the player's current strengths; you can use these values creatively
    connection.getStrength().getACurrentStrength()
    connection.getStrength().getBCurrentStrength()

    let AMaxStrength = connection.getStrength().getAMaxStrength();
    let BMaxStrength = connection.getStrength().getBMaxStrength();
    // 设置强度为最大值
    connection.setStrength('a', AMaxStrength);
    connection.setStrength('b', BMaxStrength);
    // 恒定波形3s
    let pulse = DgLabPulseUtil.smoothPulse(400, 100, 120)
    connection.clearPulse('a')
    connection.clearPulse('b')
    connection.addPulse('a', pulse)
    connection.addPulse('b', pulse)

  }
})

// AfterHurt event for 'player'
EntityEvents.hurt('player', event => {
  // Use the player's UUID to find the connected connection
  let connection = DgLabManager.getByUUID(event.getEntity().getUuid())
  // If it's not null, it means the player's DgLab (郊狼) is connected to the server
  if (connection != null) {
    let AMaxStrength = connection.getStrength().getAMaxStrength();
    let BMaxStrength = connection.getStrength().getBMaxStrength();

    let damage = event.getDamage();
    let maxHealth = event.getEntity().getMaxHealth();
    let damagePercent;
    let Astrength = 0;
    let Bstrength = 0;

    // 貌似mod不能让强度超过100，所以如果伤害溢出则固定百分数为1
    if (damage > maxHealth) {
      damagePercent = 1;
    }
    else {
      damagePercent = damage / maxHealth;
    }

    // 调试用信息
    // Utils.server.runCommand('say 受到伤害：' + event.damage);
    // Utils.server.runCommand('say 当前生命最大值：' + event.entity.maxHealth);
    // Utils.server.runCommand('say 受伤百分数：' + damagePercent);

    Astrength = damagePercent * AMaxStrength;
    Bstrength = damagePercent * BMaxStrength;

    // 调试用信息
    // Utils.server.runCommand('say 强度值：' + Astrength);

    connection.setStrength('a', Astrength);
    connection.setStrength('b', Bstrength);
    // 频率，强度，持续时间：40 == 1s
    let pulse = DgLabPulseUtil.smoothPulse(400, Astrength, 40)

    // method "clearPulse(channel)" clears all waveform queues for the current channel.
    connection.clearPulse('a')
    connection.clearPulse('b')

    // Use addPulse(channel, waveform data) to add your waveform to a channel
    connection.addPulse('a', pulse)
    connection.addPulse('b', pulse)
  }
})
// priority: 0

