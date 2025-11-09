import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('daily')
    .setDescription('Získej denní odměnu 500 Kč'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      // Kontrola existence uživatele
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      const now = Date.now();
      const cooldown = 24 * 60 * 60 * 1000; // 24 hodin v milisekundách
      const timeSinceLastDaily = now - user.last_daily;

      // Kontrola cooldownu
      if (timeSinceLastDaily < cooldown) {
        const timeLeft = cooldown - timeSinceLastDaily;
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000));
        const minutesLeft = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

        return interaction.reply({
          content: `⏰ Už jsi si dnes vybral denní odměnu! Zkus to znovu za **${hoursLeft}h ${minutesLeft}m**.`,
          ephemeral: false
        });
      }

      // Přidání peněz
      const dailyAmount = 500;
      const newMoney = user.money + dailyAmount;

      await db.query('UPDATE users SET money = $1, last_daily = $2 WHERE id = $3', [newMoney, now, userId]);

      await interaction.reply({
        content: `🎁 Získal jsi denní odměnu **${dailyAmount} Kč**! Celkem máš **${newMoney} Kč**.`,
        ephemeral: false
      });
    } catch (error) {
      console.error('Daily command error:', error);
      throw error;
    }
  }
};
