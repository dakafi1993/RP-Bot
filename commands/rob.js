import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('rob')
    .setDescription('Pokus se okrást jiného hráče')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('Koho chceš okrást?')
        .setRequired(true)
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const target = interaction.options.getUser('target');

    try {
      if (target.id === userId) {
        return interaction.reply({
          content: '❌ Nemůžeš okrást sám sebe!',
          ephemeral: false
        });
      }

      if (target.bot) {
        return interaction.reply({
          content: '❌ Nemůžeš okrást bota!',
          ephemeral: false
        });
      }

      const result1 = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result1.rows[0];
      
      const result2 = await db.query('SELECT * FROM users WHERE id = $1', [target.id]);
      const victim = result2.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      if (!victim) {
        return interaction.reply({
          content: `❌ ${target.username} ještě nemá postavu!`,
          ephemeral: false
        });
      }

      // Kontrola rob protection
      if (victim.rob_protection > Date.now()) {
        return interaction.reply({
          content: `🛡️ ${target.username} má aktivní ochranu před okradením!`,
          ephemeral: false
        });
      }

      if (victim.money < 50) {
        return interaction.reply({
          content: `❌ ${target.username} je příliš chudý na okradení!`,
          ephemeral: false
        });
      }

      let successChance = 0.6;
      
      // Thief rasový bonus (+20% úspěšnost)
      if (user.race === 'thief') {
        successChance = 0.8;
      }
      
      const success = Math.random() < successChance;

      if (success) {
        const stolen = Math.floor(victim.money * (Math.random() * 0.3 + 0.1)); // 10-40%
        const newUserMoney = user.money + stolen;
        const newVictimMoney = victim.money - stolen;

        await db.query('UPDATE users SET money = $1 WHERE id = $2', [newUserMoney, userId]);
        await db.query('UPDATE users SET money = $1 WHERE id = $2', [newVictimMoney, target.id]);

        return interaction.reply({
          content: `💰 **Úspěch!**\nOkradl jsi **${target.username}** o **${stolen} Kč**!`,
          ephemeral: false
        });
      } else {
        const fine = Math.floor(user.money * 0.2);
        const newMoney = Math.max(0, user.money - fine);

        await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, userId]);

        return interaction.reply({
          content: `🚨 **Chycen!**\n❌ Nepodařilo se ti okrást **${target.username}**!\nPlatíš pokutu **${fine} Kč**.`,
          ephemeral: false
        });
      }
    } catch (error) {
      console.error('Rob command error:', error);
      throw error;
    }
  }
};
