import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('Zobraz svůj profil'),
  
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

      // Rasové info s emoji a bonusy
      const raceData = {
        human: { emoji: '👤', name: 'Člověk', bonus: 'Žádné bonusy' },
        elf: { emoji: '🧝', name: 'Elf', bonus: '+20% výdělek z práce' },
        mage: { emoji: '🧙', name: 'Mág', bonus: '+50% získané XP' },
        warrior: { emoji: '⚔️', name: 'Válečník', bonus: '+30% úspěšnost zločinů' },
        thief: { emoji: '🗡️', name: 'Zloděj', bonus: '+20% úspěšnost krádeží' }
      };

      const race = raceData[user.race] || raceData.human;

      // Krumpáč info
      const pickaxeData = {
        wooden: { emoji: '🪵', name: 'Dřevěný krumpáč', tier: 'I' },
        iron: { emoji: '⚙️', name: 'Železný krumpáč', tier: 'II' },
        diamond: { emoji: '💎', name: 'Diamantový krumpáč', tier: 'III' }
      };

      const pickaxe = pickaxeData[user.pickaxe || 'wooden'];

      // Výpočet celkové hodnoty kovů
      const oreValues = {
        iron: user.iron * 50,
        copper: user.copper * 100,
        gold: user.gold * 500,
        diamond: user.diamond * 2000
      };
      const totalOreValue = oreValues.iron + oreValues.copper + oreValues.gold + oreValues.diamond;
      const totalWealth = user.money + totalOreValue;

      // Progress bar pro XP
      const xpProgress = Math.floor((user.xp / 100) * 10);
      const xpBar = '█'.repeat(xpProgress) + '░'.repeat(10 - xpProgress);

      const embed = new EmbedBuilder()
        .setColor(rank.color)
        .setTitle(`╔══════════════════════╗`)
        .setDescription(`**${rank.name} • ${user.name || interaction.user.username}**`)
        .setAuthor({ 
          name: interaction.user.username, 
          iconURL: interaction.user.displayAvatarURL() 
        })
        .setThumbnail(interaction.user.displayAvatarURL())
        .addFields(
          { 
            name: '━━━━━━━ 📊 STATISTIKY ━━━━━━━',
            value: 
              `${race.emoji} **Rasa:** ${race.name}\n` +
              `💡 **Bonus:** ${race.bonus}\n` +
              `⭐ **Level:** ${user.level} | � **XP:** ${user.xp}/100\n` +
              `${xpBar} \`${user.xp}%\``,
            inline: false 
          },
          { 
            name: '━━━━━━━ 💰 EKONOMIKA ━━━━━━━',
            value: 
              `💵 **Hotovost:** ${user.money.toLocaleString()} Kč\n` +
              `⛏️ **Kovy:** ${totalOreValue.toLocaleString()} Kč\n` +
              `💎 **Celkem:** ${totalWealth.toLocaleString()} Kč`,
            inline: false 
          },
          { 
            name: '━━━━━━━ 🛠️ VYBAVENÍ ━━━━━━━',
            value: 
              `${pickaxe.emoji} **${pickaxe.name}** (Tier ${pickaxe.tier})\n` +
              `💡 *Použij \`/upgrade\` pro vylepšení*`,
            inline: false 
          },
          {
            name: '⚙️ Železo',
            value: `${user.iron}x\n(${oreValues.iron} Kč)`,
            inline: true
          },
          {
            name: '� Měď',
            value: `${user.copper}x\n(${oreValues.copper} Kč)`,
            inline: true
          },
          {
            name: '🟡 Zlato',
            value: `${user.gold}x\n(${oreValues.gold} Kč)`,
            inline: true
          },
          {
            name: '� Diamant',
            value: `${user.diamond}x\n(${oreValues.diamond} Kč)`,
            inline: true
          },
          { 
            name: '━━━━━━━ 🎮 HERNÍ STATISTIKY ━━━━━━━',
            value: 
              `✅ **Výhry:** ${user.wins} | ❌ **Prohry:** ${user.losses}\n` +
              `📈 **Win Rate:** ${winRate}% | 🎯 **Celkem her:** ${totalGames}`,
            inline: false 
          }
        )
        .setTimestamp()
        .setFooter({ text: '╚══════════════════════╝' });

      // Přidání info o aktivních upgradech
      const now = Date.now();
      if (user.work_boost > now || user.rob_protection > now) {
        let upgrades = [];
        if (user.work_boost > now) {
          const timeLeft = Math.ceil((user.work_boost - now) / (1000 * 60 * 60 * 24));
          upgrades.push(`🔧 Work Boost (${timeLeft}d)`);
        }
        if (user.rob_protection > now) {
          const timeLeft = Math.ceil((user.rob_protection - now) / (1000 * 60 * 60 * 24));
          upgrades.push(`🛡️ Rob Protection (${timeLeft}d)`);
        }
        embed.addFields({ 
          name: '━━━━━━━ 🎁 AKTIVNÍ UPGRADY ━━━━━━━', 
          value: upgrades.join('\n'), 
          inline: false 
        });
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
