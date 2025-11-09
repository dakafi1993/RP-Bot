import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { SHOP_ITEMS } from './shop.js';

// Aktivní výzvy
const activeChallenges = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('arena')
    .setDescription('PvP Aréna - souboj mezi hráči')
    .addUserOption(option =>
      option.setName('opponent')
        .setDescription('Soupeř')
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Sázka (min 100 Kč)')
        .setRequired(true)
        .setMinValue(100)
    ),
  
  async execute(interaction, db) {
    const challenger = interaction.user;
    const opponent = interaction.options.getUser('opponent');
    const bet = interaction.options.getInteger('bet');

    try {
      // Kontrola zda nevyzývá sám sebe
      if (challenger.id === opponent.id) {
        return interaction.reply({
          content: '❌ Nemůžeš vyzvat sám sebe!',
          ephemeral: true
        });
      }

      // Kontrola zda soupeř není bot
      if (opponent.bot) {
        return interaction.reply({
          content: '❌ Nemůžeš vyzvat bota!',
          ephemeral: true
        });
      }

      // Načtení dat hráčů
      const challengerResult = await db.query('SELECT * FROM users WHERE id = $1', [challenger.id]);
      const opponentResult = await db.query('SELECT * FROM users WHERE id = $1', [opponent.id]);
      
      const challengerData = challengerResult.rows[0];
      const opponentData = opponentResult.rows[0];

      if (!challengerData) {
        return interaction.reply({
          content: 'Ještě nemáš postavu! Použij `/create`.',
          ephemeral: true
        });
      }

      if (!opponentData) {
        return interaction.reply({
          content: `${opponent.username} ještě nemá postavu!`,
          ephemeral: true
        });
      }

      // Kontrola peněz
      if (challengerData.money < bet) {
        return interaction.reply({
          content: `❌ Nemáš dost peněz! Potřebuješ **${bet.toLocaleString()} Kč**.`,
          ephemeral: true
        });
      }

      if (opponentData.money < bet) {
        return interaction.reply({
          content: `❌ ${opponent.username} nemá dost peněz na tuto sázku!`,
          ephemeral: true
        });
      }

      // Výpočet statistik
      const challengerStats = calculateStats(challengerData);
      const opponentStats = calculateStats(opponentData);

      const embed = new EmbedBuilder()
        .setColor(0xFF6347)
        .setTitle('⚔️ VÝZVA DO ARÉNY!')
        .setDescription(
          `${challenger} vyzývá ${opponent} na souboj!\n\n` +
          `💰 **Sázka:** ${bet.toLocaleString()} Kč\n` +
          `🏆 **Výhra:** ${(bet * 2).toLocaleString()} Kč`
        )
        .addFields(
          { 
            name: `⚔️ ${challenger.username}`,
            value: 
              `💥 DMG: ${challengerStats.damage}\n` +
              `🛡️ DEF: ${challengerStats.defense}\n` +
              `❤️ HP: ${challengerStats.hp}`,
            inline: true 
          },
          { 
            name: `⚔️ ${opponent.username}`,
            value: 
              `💥 DMG: ${opponentStats.damage}\n` +
              `🛡️ DEF: ${opponentStats.defense}\n` +
              `❤️ HP: ${opponentStats.hp}`,
            inline: true 
          }
        )
        .setFooter({ text: 'Soupeř má 60 sekund na odpověď' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('arena_accept')
            .setLabel('✅ Přijmout')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('arena_decline')
            .setLabel('❌ Odmítnout')
            .setStyle(ButtonStyle.Danger)
        );

      const message = await interaction.reply({ 
        content: `${opponent}`, 
        embeds: [embed], 
        components: [row], 
        fetchReply: true 
      });

      // Uložení výzvy
      activeChallenges.set(message.id, {
        challengerId: challenger.id,
        challengerName: challenger.username,
        opponentId: opponent.id,
        opponentName: opponent.username,
        bet: bet,
        challengerStats: challengerStats,
        opponentStats: opponentStats,
        expires: Date.now() + 60000
      });

      // Timeout po 60 sekundách
      setTimeout(() => {
        if (activeChallenges.has(message.id)) {
          activeChallenges.delete(message.id);
        }
      }, 60000);

    } catch (error) {
      console.error('Arena error:', error);
      throw error;
    }
  }
};

// Výpočet statistik hráče
function calculateStats(userData) {
  let damage = 20; // Základní damage
  let defense = 10; // Základní defense
  let hp = 100; // Základní HP

  // Přidání damage ze zbraně
  if (userData.weapon) {
    const weapon = SHOP_ITEMS[userData.weapon];
    if (weapon && weapon.damage) damage += weapon.damage;
  }

  // Přidání defense z helmy
  if (userData.helmet) {
    const helmet = SHOP_ITEMS[userData.helmet];
    if (helmet && helmet.defense) defense += helmet.defense;
  }

  // Přidání defense z brnění
  if (userData.armor) {
    const armor = SHOP_ITEMS[userData.armor];
    if (armor && armor.defense) defense += armor.defense;
  }

  // Přidání defense z bot
  if (userData.boots) {
    const boots = SHOP_ITEMS[userData.boots];
    if (boots && boots.defense) defense += boots.defense;
  }

  // Lektvar bonusy
  if (userData.potion) {
    const potion = SHOP_ITEMS[userData.potion];
    if (potion) {
      if (potion.effect === 'heal_50') hp += 50;
      if (potion.effect === 'damage_20') damage = Math.floor(damage * 1.2);
      if (potion.effect === 'defense_20') defense = Math.floor(defense * 1.2);
    }
  }

  return { damage, defense, hp };
}

// Handler pro tlačítka
export async function handleArenaButton(interaction, db) {
  const messageId = interaction.message.id;
  const challenge = activeChallenges.get(messageId);

  if (!challenge) {
    return interaction.reply({
      content: '❌ Tato výzva již vypršela!',
      ephemeral: true
    });
  }

  // Pouze soupeř může odpovědět
  if (interaction.user.id !== challenge.opponentId) {
    return interaction.reply({
      content: '❌ Toto není tvoje výzva!',
      ephemeral: true
    });
  }

  if (interaction.customId === 'arena_decline') {
    activeChallenges.delete(messageId);
    
    const embed = new EmbedBuilder()
      .setColor(0x95A5A6)
      .setTitle('❌ Výzva odmítnuta')
      .setDescription(`<@${challenge.opponentId}> odmítl výzvu do arény.`);

    await interaction.update({ embeds: [embed], components: [] });
    return;
  }

  if (interaction.customId === 'arena_accept') {
    activeChallenges.delete(messageId);

    // Získání avatarů
    const challengerUser = await interaction.client.users.fetch(challenge.challengerId);
    const opponentUser = await interaction.client.users.fetch(challenge.opponentId);

    // Animace začátku boje s kartami
    const startEmbed = new EmbedBuilder()
      .setColor(0xFF6347)
      .setTitle('⚔️ BŮJ ZAČÍNÁ!')
      .setDescription(
        `╔═══════════════════════════════╗\n` +
        `║          SOUBOJNÍCI          ║\n` +
        `╚═══════════════════════════════╝`
      )
      .addFields(
        { 
          name: `⚔️ ${challenge.challengerName}`,
          value: 
            `💥 DMG: ${challenge.challengerStats.damage}\n` +
            `🛡️ DEF: ${challenge.challengerStats.defense}\n` +
            `❤️ HP: ${challenge.challengerStats.hp}/${challenge.challengerStats.hp}`,
          inline: true 
        },
        { name: '\u200b', value: '**VS**', inline: true },
        { 
          name: `⚔️ ${challenge.opponentName}`,
          value: 
            `💥 DMG: ${challenge.opponentStats.damage}\n` +
            `🛡️ DEF: ${challenge.opponentStats.defense}\n` +
            `❤️ HP: ${challenge.opponentStats.hp}/${challenge.opponentStats.hp}`,
          inline: true 
        }
      )
      .setThumbnail(challengerUser.displayAvatarURL())
      .setImage(opponentUser.displayAvatarURL())
      .setTimestamp();

    await interaction.update({ embeds: [startEmbed], components: [] });
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Simulace boje s real-time updates
    const battleLog = await simulateBattleWithUpdates(challenge, interaction, challengerUser, opponentUser);

    // Aktualizace peněz a statistik
    const winnerId = battleLog.winner;
    const loserId = winnerId === challenge.challengerId ? challenge.opponentId : challenge.challengerId;
    const winnerName = winnerId === challenge.challengerId ? challenge.challengerName : challenge.opponentName;
    const loserName = loserId === challenge.challengerId ? challenge.challengerName : challenge.opponentName;

    await db.query(
      'UPDATE users SET money = money + $1, wins = wins + 1 WHERE id = $2',
      [challenge.bet, winnerId]
    );

    await db.query(
      'UPDATE users SET money = money - $1, losses = losses + 1 WHERE id = $2',
      [challenge.bet, loserId]
    );

    // Spotřebovat lektvary
    await db.query('UPDATE users SET potion = NULL WHERE id = $1 OR id = $2', [challenge.challengerId, challenge.opponentId]);

    // Snížení durability vybavení podle damage
    const challengerDurabilityLoss = Math.ceil(battleLog.challengerDamageTaken / 10);
    const opponentDurabilityLoss = Math.ceil(battleLog.opponentDamageTaken / 10);

    // Challenger durability
    await db.query(`
      UPDATE users 
      SET 
        weapon_durability = GREATEST(0, COALESCE(weapon_durability, 100) - $1),
        helmet_durability = GREATEST(0, COALESCE(helmet_durability, 100) - $1),
        armor_durability = GREATEST(0, COALESCE(armor_durability, 100) - $1),
        boots_durability = GREATEST(0, COALESCE(boots_durability, 100) - $1)
      WHERE id = $2
    `, [challengerDurabilityLoss, challenge.challengerId]);

    // Opponent durability
    await db.query(`
      UPDATE users 
      SET 
        weapon_durability = GREATEST(0, COALESCE(weapon_durability, 100) - $1),
        helmet_durability = GREATEST(0, COALESCE(helmet_durability, 100) - $1),
        armor_durability = GREATEST(0, COALESCE(armor_durability, 100) - $1),
        boots_durability = GREATEST(0, COALESCE(boots_durability, 100) - $1)
      WHERE id = $2
    `, [opponentDurabilityLoss, challenge.opponentId]);

    // Finální výsledky s avatarem vítěze
    const finalEmbed = new EmbedBuilder()
      .setColor(winnerId === challenge.challengerId ? 0x2ECC71 : 0xE74C3C)
      .setTitle('⚔️ ARÉNA - VÝSLEDEK SOUBOJE')
      .setDescription(
        `╔═══════════════════════════════╗\n` +
        `║          VÍTĚZ!              ║\n` +
        `╚═══════════════════════════════╝\n\n` +
        `🏆 **${winnerName}** <@${winnerId}> zvítězil!\n` +
        `💰 Získává **${challenge.bet.toLocaleString()} Kč**!`
      )
      .addFields(
        { 
          name: '📊 Finální statistiky', 
          value: 
            `**${challenge.challengerName}:**\n` +
            `└ ${battleLog.challengerDamageTaken} DMG přijato | -${challengerDurabilityLoss}% durability\n\n` +
            `**${challenge.opponentName}:**\n` +
            `└ ${battleLog.opponentDamageTaken} DMG přijato | -${opponentDurabilityLoss}% durability`,
          inline: false 
        }
      )
      .setThumbnail(winnerId === challenge.challengerId ? challengerUser.displayAvatarURL() : opponentUser.displayAvatarURL())
      .setFooter({ text: 'GG WP!' })
      .setTimestamp();

    await interaction.editReply({ embeds: [finalEmbed], components: [] });

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('⚔️ ARÉNA - VÝSLEDEK SOUBOJE')
      .setDescription(battleLog.description)
      .addFields(
        { name: '🏆 Vítěz', value: `**${winnerName}** <@${winnerId}>`, inline: true },
        { name: '� Poražený', value: `**${loserName}** <@${loserId}>`, inline: true },
        { name: '�💰 Výhra', value: `${challenge.bet.toLocaleString()} Kč`, inline: true }
      )
      .addFields(
        { 
          name: '📊 Detailní statistiky', 
          value: 
            `**${challenge.challengerName}:** ${battleLog.challengerDamageTaken} DMG přijato | -${challengerDurabilityLoss} durability\n` +
            `**${challenge.opponentName}:** ${battleLog.opponentDamageTaken} DMG přijato | -${opponentDurabilityLoss} durability`,
          inline: false 
        }
      )
      .setFooter({ text: 'GG WP!' });

    await interaction.update({ embeds: [embed], components: [] });
  }
}

// Simulace boje
function simulateBattle(challenge) {
  let challengerHp = challenge.challengerStats.hp;
  let opponentHp = challenge.opponentStats.hp;

  let round = 0;
  let log = '';
  let challengerDamageTaken = 0;
  let opponentDamageTaken = 0;

  while (challengerHp > 0 && opponentHp > 0 && round < 20) {
    round++;

    // Challenger útočí
    const challengerDamage = Math.max(1, challenge.challengerStats.damage - Math.floor(challenge.opponentStats.defense / 2));
    opponentHp -= challengerDamage;
    opponentDamageTaken += challengerDamage;
    log += `🗡️ Útok 1: ${challengerDamage} DMG (${Math.max(0, opponentHp)} HP)\n`;

    if (opponentHp <= 0) break;

    // Opponent útočí
    const opponentDamage = Math.max(1, challenge.opponentStats.damage - Math.floor(challenge.challengerStats.defense / 2));
    challengerHp -= opponentDamage;
    challengerDamageTaken += opponentDamage;
    log += `⚔️ Útok 2: ${opponentDamage} DMG (${Math.max(0, challengerHp)} HP)\n`;
  }

  const winner = challengerHp > 0 ? challenge.challengerId : challenge.opponentId;

  return {
    winner: winner,
    challengerDamageTaken: challengerDamageTaken,
    opponentDamageTaken: opponentDamageTaken,
    description: `**📜 Průběh souboje:**\n\`\`\`\n${log}\`\`\`\n${challengerHp > 0 ? '🏆 Hráč 1 vyhrál!' : '🏆 Hráč 2 vyhrál!'}`
  };
}

// Simulace boje s real-time updates a kartami
async function simulateBattleWithUpdates(challenge, interaction, challengerUser, opponentUser) {
  let challengerHp = challenge.challengerStats.hp;
  let opponentHp = challenge.opponentStats.hp;
  const maxChallengerHp = challenge.challengerStats.hp;
  const maxOpponentHp = challenge.opponentStats.hp;

  let round = 0;
  let challengerDamageTaken = 0;
  let opponentDamageTaken = 0;

  while (challengerHp > 0 && opponentHp > 0 && round < 20) {
    round++;

    // Challenger útočí
    const challengerDamage = Math.max(1, challenge.challengerStats.damage - Math.floor(challenge.opponentStats.defense / 2));
    opponentHp -= challengerDamage;
    opponentDamageTaken += challengerDamage;

    // Update embed po útoku challengera
    const battleEmbed = new EmbedBuilder()
      .setColor(0xFFAA00)
      .setTitle(`⚔️ SOUBOJ - KOLO ${round}`)
      .setDescription(
        `╔═══════════════════════════════╗\n` +
        `║       PROBÍHÁ SOUBOJ!        ║\n` +
        `╚═══════════════════════════════╝`
      )
      .addFields(
        { 
          name: `⚔️ ${challenge.challengerName}`,
          value: 
            `❤️ HP: ${Math.max(0, challengerHp)}/${maxChallengerHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((challengerHp / maxChallengerHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((challengerHp / maxChallengerHp) * 10)))}\n` +
            `🗡️ Útočí: **${challengerDamage} DMG**`,
          inline: true 
        },
        { name: '\u200b', value: '**VS**', inline: true },
        { 
          name: `⚔️ ${challenge.opponentName}`,
          value: 
            `❤️ HP: ${Math.max(0, opponentHp)}/${maxOpponentHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((opponentHp / maxOpponentHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((opponentHp / maxOpponentHp) * 10)))}\n` +
            `💥 Přijal: **-${challengerDamage} HP**`,
          inline: true 
        }
      )
      .setThumbnail(challengerUser.displayAvatarURL())
      .setImage(opponentUser.displayAvatarURL())
      .setTimestamp();

    await interaction.editReply({ embeds: [battleEmbed] });
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (opponentHp <= 0) break;

    // Opponent útočí
    const opponentDamage = Math.max(1, challenge.opponentStats.damage - Math.floor(challenge.challengerStats.defense / 2));
    challengerHp -= opponentDamage;
    challengerDamageTaken += opponentDamage;

    // Update embed po útoku opponenta
    const battleEmbed2 = new EmbedBuilder()
      .setColor(0xFF6347)
      .setTitle(`⚔️ SOUBOJ - KOLO ${round}`)
      .setDescription(
        `╔═══════════════════════════════╗\n` +
        `║       PROBÍHÁ SOUBOJ!        ║\n` +
        `╚═══════════════════════════════╝`
      )
      .addFields(
        { 
          name: `⚔️ ${challenge.challengerName}`,
          value: 
            `❤️ HP: ${Math.max(0, challengerHp)}/${maxChallengerHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((challengerHp / maxChallengerHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((challengerHp / maxChallengerHp) * 10)))}\n` +
            `💥 Přijal: **-${opponentDamage} HP**`,
          inline: true 
        },
        { name: '\u200b', value: '**VS**', inline: true },
        { 
          name: `⚔️ ${challenge.opponentName}`,
          value: 
            `❤️ HP: ${Math.max(0, opponentHp)}/${maxOpponentHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((opponentHp / maxOpponentHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((opponentHp / maxOpponentHp) * 10)))}\n` +
            `🗡️ Útočí: **${opponentDamage} DMG**`,
          inline: true 
        }
      )
      .setThumbnail(opponentUser.displayAvatarURL())
      .setImage(challengerUser.displayAvatarURL())
      .setTimestamp();

    await interaction.editReply({ embeds: [battleEmbed2] });
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  const winner = challengerHp > 0 ? challenge.challengerId : challenge.opponentId;

  return {
    winner: winner,
    challengerDamageTaken: challengerDamageTaken,
    opponentDamageTaken: opponentDamageTaken
  };
}
