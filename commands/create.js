import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Vytvoř si postavu v RP světě'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      // Kontrola existence uživatele
      const existing = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (existing) {
        return interaction.reply({ 
          content: 'Už máš postavu!', 
          ephemeral: false 
        });
      }

      // Vytvoření nové postavy
      db.prepare('INSERT INTO users (id, money, xp, level, last_daily) VALUES (?, 0, 0, 1, 0)')
        .run(userId);

      await interaction.reply({
        content: `✅ Postava pro ${interaction.user.username} byla úspěšně vytvořena!`,
        ephemeral: false
      });
    } catch (error) {
      console.error('Create command error:', error);
      throw error;
    }
  }
};
