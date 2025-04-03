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

// 玩家死亡事件
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
    // 需要简单自定义的话，可以直接在强度值后面乘以一个小数，比如A强度值：AMaxStrength * 0.8，这将使死亡时的强度值为最大强度值的80%
    connection.setStrength('a', AMaxStrength);
    connection.setStrength('b', BMaxStrength);

    // 恒定波形3s
    // 这里，40为一秒，120为3秒
    let pulse = DgLabPulseUtil.smoothPulse(400, 100, 120)
    connection.clearPulse('a')
    connection.clearPulse('b')
    connection.addPulse('a', pulse)
    connection.addPulse('b', pulse)

  }
})

// 玩家受伤事件
EntityEvents.hurt('player', event => {
  // Use the player's UUID to find the connected connection
  let connection = DgLabManager.getByUUID(event.getEntity().getUuid())
  // If it's not null, it means the player's DgLab (郊狼) is connected to the server
  if (connection != null) {
    let AMaxStrength = connection.getStrength().getAMaxStrength();
    let BMaxStrength = connection.getStrength().getBMaxStrength();
    let maxHealth = event.entity.maxHealth;
    let Astrength = 0;
    let Bstrength = 0;

    // hurt事件触发后，生命值不会立刻变动，因此可以得到受伤前的生命值
    let healthBeforeHurt = event.entity.health;

    // 调试用信息
    // Utils.server.runCommand('say 受伤前生命值：' + healthBeforeHurt);

    event.server.scheduleInTicks(1, () => {
      // 等待一个tick，血量变动后即可得到受伤后的生命值
      let healthAfterHurt = event.entity.health;

      // 如果受伤后的生命值为0，直接结束这次事件的判断，因为死亡后有死亡事件的处理
      if (healthAfterHurt <= 0) {
        return;
      }

      // 调试用信息
      // Utils.server.runCommand('say 受伤后生命值：' + healthAfterHurt);

      // 实际的受伤值为生命值的变动值
      // 因为受伤后生命值貌似最低为0，所以先不做其他处理
      let damage = healthBeforeHurt - healthAfterHurt;

      // 在举盾格挡且回血时，受伤值可能为负数，所以将受伤值限制为0
      damage = Math.max(0, damage);

      // 伤害百分比
      //貌似不会发生伤害溢出，所以不需要判断
      let damagePercent = damage / maxHealth;

      // 调试用信息
      // Utils.server.runCommand('say 受到伤害：' + damage);
      // Utils.server.runCommand('say 当前生命最大值：' + maxHealth);
      // Utils.server.runCommand('say 受伤百分数：' + damagePercent);

      // 只有受到伤害时才会计算和设置强度
      if (damage > 0) {
        Astrength = damagePercent * AMaxStrength;
        Bstrength = damagePercent * BMaxStrength;
        // 调试用信息
        // Utils.server.runCommand('say A强度值：' + Astrength);
        // Utils.server.runCommand('say B强度值：' + Bstrength);

        // 设置强度
        connection.setStrength('a', Astrength);
        connection.setStrength('b', Bstrength);
        // 频率，强度，持续时间：40 == 1s
        // 波形的强度太低会导致波形几乎没有，所以目前还是固定吧
        let pulse = DgLabPulseUtil.smoothPulse(400, 100, 40)

        // method "clearPulse(channel)" clears all waveform queues for the current channel.
        connection.clearPulse('a')
        connection.clearPulse('b')

        // Use addPulse(channel, waveform data) to add your waveform to a channel
        connection.addPulse('a', pulse)
        connection.addPulse('b', pulse)
      }
    });
  }
})
// priority: 0

