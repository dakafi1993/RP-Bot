import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Zobraz svůj profil'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Výpočet win rate
      const totalGames = user.wins + user.losses;
      const winRate = totalGames > 0 ? ((user.wins / totalGames) * 100).toFixed(1) : 0;

      // Rank podle levelu
      const ranks = [
        { level: 1, name: '🥉 Nováček', color: 0xCD7F32 },
        { level: 5, name: '🥈 Pokročilý', color: 0xC0C0C0 },
        { level: 10, name: '🥇 Expert', color: 0xFFD700 },
        { level: 20, name: '💎 Mistr', color: 0x00CED1 },
        { level: 30, name: '👑 Legenda', color: 0xFF1493 }
      ];

      let rank = ranks[0];
      for (const r of ranks) {
        if (user.level >= r.level) rank = r;
      }

      const embed = new EmbedBuilder()
        .setColor(rank.color)
        .setTitle(`${rank.name}`)
        .setAuthor({ name: `${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() })
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { name: '💰 Peníze', value: `${user.money} Kč`, inline: true },
          { name: '⭐ Level', value: `${user.level}`, inline: true },
          { name: '📊 XP', value: `${user.xp}/100`, inline: true },
          { name: '\u200B', value: '\u200B', inline: false },
          { name: '🎮 Výhry', value: `${user.wins}`, inline: true },
          { name: '💔 Prohry', value: `${user.losses}`, inline: true },
          { name: '📈 Win Rate', value: `${winRate}%`, inline: true }
        )
        .setTimestamp()
        .setFooter({ text: 'RP Bot System' });

      // Přidání info o upgradech
      if (user.work_boost > 0 || user.rob_protection > 0) {
        let upgrades = [];
        if (user.work_boost > 0) upgrades.push('🔧 Work Boost');
        if (user.rob_protection > 0) upgrades.push('🛡️ Rob Protection');
        embed.addFields({ name: '🎁 Aktivní upgrady', value: upgrades.join('\n'), inline: false });
      }

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
