import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Zobraz svůj profil'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      // Načtení uživatele z databáze
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Vytvoření embed profilu
      const embed = new EmbedBuilder()
        .setColor(0x00AE86)
        .setTitle(`📊 Profil: ${interaction.user.username}`)
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '💰 Peníze', value: `${user.money} Kč`, inline: true },
          { name: '⭐ XP', value: `${user.xp}/100`, inline: true },
          { name: '📈 Level', value: `${user.level}`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'RP Bot System' });

      await interaction.reply({ 
        embeds: [embed],
        ephemeral: false
      });
    } catch (error) {
      console.error('Profile command error:', error);
      throw error;
    }
  }
};
