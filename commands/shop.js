import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Obchod s upgrady'),
  
  async execute(interaction, db) {
    try {
      const embed = new EmbedBuilder()
        .setColor(0xFF6B35)
        .setTitle('🏪 Obchod')
        .setDescription('Brzy zde budou k dispozici upgrady a itemy!')
        .addFields(
          { name: '🔜 Připravujeme', value: 'Work boost\nDaily boost\nRob protection\nGamble luck', inline: false }
        )
        .setTimestamp()
        .setFooter({ text: 'RP Bot System' });

      await interaction.reply({ 
        embeds: [embed],
        ephemeral: false
      });
    } catch (error) {
      console.error('Shop command error:', error);
      throw error;
    }
  }
};
