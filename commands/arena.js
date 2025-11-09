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
        opponentId: opponent.id,
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

    // Simulace boje
    const battleLog = simulateBattle(challenge);

    // Aktualizace peněz a statistik
    const winnerId = battleLog.winner;
    const loserId = winnerId === challenge.challengerId ? challenge.opponentId : challenge.challengerId;

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

    const embed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('⚔️ ARÉNA - VÝSLEDEK SOUBOJE')
      .setDescription(battleLog.description)
      .addFields(
        { name: '🏆 Vítěz', value: `<@${winnerId}>`, inline: true },
        { name: '💰 Výhra', value: `${challenge.bet.toLocaleString()} Kč`, inline: true }
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

  while (challengerHp > 0 && opponentHp > 0 && round < 20) {
    round++;

    // Challenger útočí
    const challengerDamage = Math.max(1, challenge.challengerStats.damage - Math.floor(challenge.opponentStats.defense / 2));
    opponentHp -= challengerDamage;
    log += `🗡️ Útok 1: ${challengerDamage} DMG (${Math.max(0, opponentHp)} HP)\n`;

    if (opponentHp <= 0) break;

    // Opponent útočí
    const opponentDamage = Math.max(1, challenge.opponentStats.damage - Math.floor(challenge.challengerStats.defense / 2));
    challengerHp -= opponentDamage;
    log += `⚔️ Útok 2: ${opponentDamage} DMG (${Math.max(0, challengerHp)} HP)\n`;
  }

  const winner = challengerHp > 0 ? challenge.challengerId : challenge.opponentId;

  return {
    winner: winner,
    description: `**📜 Průběh souboje:**\n\`\`\`\n${log}\`\`\`\n${challengerHp > 0 ? '🏆 Hráč 1 vyhrál!' : '🏆 Hráč 2 vyhrál!'}`
  };
}
