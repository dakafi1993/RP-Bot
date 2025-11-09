import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('leaderboard')
    .setDescription('Zobraz žebříček nejlepších hráčů'),
  
  async execute(interaction, db) {
    try {
      // Získání top 10 hráčů seřazených podle levelu a peněz
      const result = await db.query(`
        SELECT id, money, xp, level 
        FROM users 
        ORDER BY level DESC, money DESC 
        LIMIT 10
      `);
      const topUsers = result.rows;

      if (topUsers.length === 0) {
        return interaction.reply({
          content: 'Zatím nemá nikdo postavu!',
          ephemeral: false
        });
      }

      // Vytvoření embed žebříčku
      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏆 Žebříček hráčů')
        .setDescription('Top 10 hráčů podle levelu a peněz')
        .setTimestamp()
        .setFooter({ text: 'RP Bot System' });

      // Medaile pro top 3
      const medals = ['🥇', '🥈', '🥉'];

      // Přidání hráčů do embedu
      for (let i = 0; i < topUsers.length; i++) {
        const user = topUsers[i];
        const medal = i < 3 ? medals[i] : `${i + 1}.`;
        
        try {
          const discordUser = await interaction.client.users.fetch(user.id);
          const username = discordUser.username;
          
          embed.addFields({
            name: `${medal} ${username}`,
            value: `Level: **${user.level}** | Peníze: **${user.money} Kč** | XP: **${user.xp}/100**`,
            inline: false
          });
        } catch (error) {
          // Pokud se nepodaří načíst uživatele, použij ID
          embed.addFields({
            name: `${medal} Uživatel ${user.id}`,
            value: `Level: **${user.level}** | Peníze: **${user.money} Kč** | XP: **${user.xp}/100**`,
            inline: false
          });
        }
      }

      await interaction.reply({
        embeds: [embed],
        ephemeral: false
      });
    } catch (error) {
      console.error('Leaderboard command error:', error);
      throw error;
    }
  }
};
