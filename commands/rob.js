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

      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
      const victim = db.prepare('SELECT * FROM users WHERE id = ?').get(target.id);

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

      const success = Math.random() < 0.6;

      if (success) {
        const stolen = Math.floor(victim.money * (Math.random() * 0.3 + 0.1)); // 10-40%
        const newUserMoney = user.money + stolen;
        const newVictimMoney = victim.money - stolen;

        db.prepare('UPDATE users SET money = ? WHERE id = ?').run(newUserMoney, userId);
        db.prepare('UPDATE users SET money = ? WHERE id = ?').run(newVictimMoney, target.id);

        return interaction.reply({
          content: `💰 **Úspěch!**\nOkradl jsi **${target.username}** o **${stolen} Kč**!`,
          ephemeral: false
        });
      } else {
        const fine = Math.floor(user.money * 0.2);
        const newMoney = Math.max(0, user.money - fine);

        db.prepare('UPDATE users SET money = ? WHERE id = ?').run(newMoney, userId);

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
