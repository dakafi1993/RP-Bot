const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Work to earn money and XP'),
  async execute(interaction, db) {
    const userId = interaction.user.id;

    const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

    if (!user) {
      return interaction.reply({ content: 'You don\'t have a character yet! Use `/create` to make one.', ephemeral: true });
    }

    const moneyEarned = Math.floor(Math.random() * 100) + 50;
    const xpEarned = Math.floor(Math.random() * 20) + 10;

    const newXp = user.xp + xpEarned;
    const newMoney = user.money + moneyEarned;
    
    let newLevel = user.level;
    const xpNeeded = user.level * 100;
    
    if (newXp >= xpNeeded) {
      newLevel++;
    }

    db.prepare('UPDATE users SET money = ?, xp = ?, level = ? WHERE user_id = ?')
      .run(newMoney, newXp, newLevel, userId);

    let response = `You worked and earned **$${moneyEarned}** and **${xpEarned} XP**!`;
    
    if (newLevel > user.level) {
      response += `\n🎉 You leveled up to level **${newLevel}**!`;
    }

    await interaction.reply(response);
  }
};
