import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('inventory')
    .setDescription('Zobraz svůj inventář s kovy'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      const totalOres = user.iron + user.copper + user.gold + user.diamond;
      const totalValue = (user.iron * 50) + (user.copper * 100) + (user.gold * 500) + (user.diamond * 2000);

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle(`📦 Inventář - ${user.name}`)
        .setDescription('Tvé vytěžené kovy:')
        .addFields(
          { name: '⚙️ Železo', value: `**${user.iron}x** (${user.iron * 50} Kč)`, inline: true },
          { name: '🟠 Měď', value: `**${user.copper}x** (${user.copper * 100} Kč)`, inline: true },
          { name: '🟡 Zlato', value: `**${user.gold}x** (${user.gold * 500} Kč)`, inline: true },
          { name: '💎 Diamant', value: `**${user.diamond}x** (${user.diamond * 2000} Kč)`, inline: true },
          { name: '📊 Celkem', value: `**${totalOres}x** kovů`, inline: true },
          { name: '💰 Hodnota', value: `**${totalValue} Kč**`, inline: true }
        )
        .setFooter({ text: 'Použij /sell pro prodej nebo /auction pro aukci' })
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Inventory command error:', error);
      throw error;
    }
  }
};
