import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Pracuj a vyděláj peníze a XP'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      // Kontrola existence uživatele
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Generování náhodného výdělku
      const moneyEarned = Math.floor(Math.random() * 191) + 10; // 10 - 200
      const xpEarned = Math.floor(Math.random() * 10) + 1; // 1 - 10

      let newXp = user.xp + xpEarned;
      let newMoney = user.money + moneyEarned;
      let newLevel = user.level;
      let leveledUp = false;

      // Kontrola levelování
      if (newXp >= 100) {
        newLevel++;
        newXp = 0;
        leveledUp = true;
      }

      // Aktualizace databáze
      db.prepare('UPDATE users SET money = ?, xp = ?, level = ? WHERE id = ?')
        .run(newMoney, newXp, newLevel, userId);

      // Odpověď
      let response = `💼 Pracoval jsi a vydělal **${moneyEarned} Kč** a **${xpEarned} XP**!`;
      
      if (leveledUp) {
        response += `\n\n🎉 **LEVEL UP!** Nyní jsi level **${newLevel}**!`;
      }

      await interaction.reply({
        content: response,
        ephemeral: false
      });
    } catch (error) {
      console.error('Work command error:', error);
      throw error;
    }
  }
};
