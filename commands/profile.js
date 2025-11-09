import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SHOP_ITEMS } from './shop.js';
import { checkRealmProgression } from '../utils/realm-progression.js';

// Admin a Moderátor ID pro badge
const ADMIN_USER_IDS = ['1436690629949263964'];
const MODERATOR_USER_IDS = ['1404534814857494708', '1436690629949263964'];

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

      // Kontrola a oprava realm progression (při každém zobrazení profilu)
      await checkRealmProgression(db, userId, user.level, user.realm);
      
      // Znovu načíst data po možné změně
      const updatedResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const updatedUser = updatedResult.rows[0];

      // Výpočet win rate
      const totalGames = updatedUser.wins + updatedUser.losses;
      const winRate = totalGames > 0 ? ((updatedUser.wins / totalGames) * 100).toFixed(1) : 0;

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
        if (updatedUser.level >= r.level) rank = r;
      }

      // Rasové info s emoji a bonusy
      const raceData = {
        human: { emoji: '👤', name: 'Člověk', bonus: 'Žádné bonusy' },
        elf: { emoji: '🧝', name: 'Elf', bonus: '+20% výdělek z práce' },
        mage: { emoji: '🧙', name: 'Mág', bonus: '+50% získané XP' },
        warrior: { emoji: '⚔️', name: 'Válečník', bonus: '+30% úspěšnost zločinů' },
        thief: { emoji: '🗡️', name: 'Zloděj', bonus: '+20% úspěšnost krádeží' }
      };

      const race = raceData[updatedUser.race] || raceData.human;

      // Krumpáč info
      const pickaxeData = {
        wooden: { emoji: '🪵', name: 'Dřevěný krumpáč', tier: 'I' },
        iron: { emoji: '⚙️', name: 'Železný krumpáč', tier: 'II' },
        diamond: { emoji: '💎', name: 'Diamantový krumpáč', tier: 'III' }
      };

      const pickaxe = pickaxeData[updatedUser.pickaxe || 'wooden'];

      // Výpočet celkové hodnoty kovů
      const oreValues = {
        iron: updatedUser.iron * 50,
        copper: updatedUser.copper * 100,
        gold: updatedUser.gold * 500,
        diamond: updatedUser.diamond * 2000
      };
      const totalOreValue = oreValues.iron + oreValues.copper + oreValues.gold + oreValues.diamond;
      const totalWealth = updatedUser.money + totalOreValue;

      // Progress bar pro XP
      const xpProgress = Math.floor((updatedUser.xp / 100) * 10);
      const xpBar = '█'.repeat(xpProgress) + '░'.repeat(10 - xpProgress);

      // Admin/Moderátor badge
      const isAdmin = ADMIN_USER_IDS.includes(userId);
      const isModerator = MODERATOR_USER_IDS.includes(userId);
      let statusBadge = '';
      if (isAdmin) {
        statusBadge = '\n👑 **STATUS:** Admin';
      } else if (isModerator) {
        statusBadge = '\n🛡️ **STATUS:** Moderátor';
      }

      // Říše systém
      const realmData = {
        ancient: { emoji: '🏛️', name: 'Starodávná říše', color: 0x8B4513 },
        medieval: { emoji: '🏰', name: 'Středověká říše', color: 0x696969 },
        renaissance: { emoji: '🎨', name: 'Renesanční říše', color: 0xDAA520 },
        modern: { emoji: '🏙️', name: 'Moderní říše', color: 0x4682B4 },
        futuristic: { emoji: '🚀', name: 'Futuristická říše', color: 0x9370DB }
      };
      
      const realm = realmData[updatedUser.realm || 'ancient'];

      // Vybavení
      const weaponItem = updatedUser.weapon ? SHOP_ITEMS[updatedUser.weapon] : null;
      const helmetItem = updatedUser.helmet ? SHOP_ITEMS[updatedUser.helmet] : null;
      const armorItem = updatedUser.armor ? SHOP_ITEMS[updatedUser.armor] : null;
      const bootsItem = updatedUser.boots ? SHOP_ITEMS[updatedUser.boots] : null;
      const potionItem = updatedUser.potion ? SHOP_ITEMS[updatedUser.potion] : null;

      // Durability pro každý item
      const weaponDur = updatedUser.weapon_durability || 100;
      const helmetDur = updatedUser.helmet_durability || 100;
      const armorDur = updatedUser.armor_durability || 100;
      const bootsDur = updatedUser.boots_durability || 100;

      // Určení stavu durability (emoji)
      const getDurabilityEmoji = (dur) => {
        if (dur >= 80) return '🟢';
        if (dur >= 50) return '🟡';
        if (dur >= 20) return '🟠';
        return '🔴';
      };

      let equipmentText = '';
      equipmentText += `⚔️ **Zbraň:** ${weaponItem ? `${weaponItem.name} ${getDurabilityEmoji(weaponDur)} (${weaponDur}%)` : '---'}\n`;
      equipmentText += `⛑️ **Helma:** ${helmetItem ? `${helmetItem.name} ${getDurabilityEmoji(helmetDur)} (${helmetDur}%)` : '---'}\n`;
      equipmentText += `🛡️ **Brnění:** ${armorItem ? `${armorItem.name} ${getDurabilityEmoji(armorDur)} (${armorDur}%)` : '---'}\n`;
      equipmentText += `👟 **Boty:** ${bootsItem ? `${bootsItem.name} ${getDurabilityEmoji(bootsDur)} (${bootsDur}%)` : '---'}\n`;
      equipmentText += `🧪 **Lektvar:** ${potionItem ? potionItem.name : '---'}`;

      // Celkové statistiky bojovníka
      let totalDamage = 0;
      let totalDefense = 0;
      if (weaponItem && weaponItem.damage) totalDamage += weaponItem.damage;
      if (helmetItem && helmetItem.defense) totalDefense += helmetItem.defense;
      if (armorItem && armorItem.defense) totalDefense += armorItem.defense;
      if (bootsItem && bootsItem.defense) totalDefense += bootsItem.defense;

      const embed = new EmbedBuilder()
        .setColor(realm.color)
        .setTitle(`╔══════════════════════╗`)
        .setDescription(
          `**${rank.name} • ${updatedUser.name || interaction.user.username}**${statusBadge}\n` +
          `${realm.emoji} **${realm.name}** | Století: ${updatedUser.century || 1}`
        )
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
              `⭐ **Level:** ${updatedUser.level} | 📈 **XP:** ${updatedUser.xp}/100\n` +
              `${xpBar} \`${updatedUser.xp}%\``,
            inline: false 
          },
          { 
            name: '━━━━━━━ 💰 EKONOMIKA ━━━━━━━',
            value: 
              `💵 **Hotovost:** ${updatedUser.money.toLocaleString()} Kč\n` +
              `⛏️ **Kovy:** ${totalOreValue.toLocaleString()} Kč\n` +
              `💎 **Celkem:** ${totalWealth.toLocaleString()} Kč`,
            inline: false 
          },
          { 
            name: '━━━━━━━ 🛠️ VYBAVENÍ ━━━━━━━',
            value: 
              `${pickaxe.emoji} **${pickaxe.name}** (${updatedUser.pickaxe_durability || 100}%)\n` +
              `💡 *Použij \`/upgrade\` nebo \`/repair\`*`,
            inline: false 
          },
          { 
            name: '━━━━━━━ ⚔️ POSTAVA ━━━━━━━',
            value: 
              equipmentText + `\n\n` +
              `💥 **Celkem DMG:** ${totalDamage}\n` +
              `🛡️ **Celkem DEF:** ${totalDefense}`,
            inline: false 
          },
          {
            name: '⚙️ Železo',
            value: `${updatedUser.iron}x\n(${oreValues.iron} Kč)`,
            inline: true
          },
          {
            name: '🟤 Měď',
            value: `${updatedUser.copper}x\n(${oreValues.copper} Kč)`,
            inline: true
          },
          {
            name: '🟡 Zlato',
            value: `${updatedUser.gold}x\n(${oreValues.gold} Kč)`,
            inline: true
          },
          {
            name: '💎 Diamant',
            value: `${updatedUser.diamond}x\n(${oreValues.diamond} Kč)`,
            inline: true
          },
          { 
            name: '━━━━━━━ 🎮 HERNÍ STATISTIKY ━━━━━━━',
            value: 
              `✅ **Výhry:** ${updatedUser.wins} | ❌ **Prohry:** ${updatedUser.losses}\n` +
              `📈 **Win Rate:** ${winRate}% | 🎯 **Celkem her:** ${totalGames}`,
            inline: false 
          }
        )
        .setTimestamp()
        .setFooter({ text: '╚══════════════════════╝' });

      // Přidání info o aktivních upgradech
      const now = Date.now();
      if (updatedUser.work_boost > now || updatedUser.rob_protection > now) {
        let upgrades = [];
        if (updatedUser.work_boost > now) {
          const timeLeft = Math.ceil((updatedUser.work_boost - now) / (1000 * 60 * 60 * 24));
          upgrades.push(`🔧 Work Boost (${timeLeft}d)`);
        }
        if (updatedUser.rob_protection > now) {
          const timeLeft = Math.ceil((updatedUser.rob_protection - now) / (1000 * 60 * 60 * 24));
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
