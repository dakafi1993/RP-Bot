import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SHOP_ITEMS } from './shop.js';
import { checkRealmProgression } from '../utils/realm-progression.js';

// Příšery podle říše (s avatary)
const MONSTERS = {
  ancient: [
    { name: 'Goblin', hp: 50, damage: 15, defense: 5, reward: { min: 200, max: 500 }, xp: 20, avatar: 'https://i.imgur.com/7qYjKQs.png', emoji: '👹' },
    { name: 'Vlk', hp: 60, damage: 18, defense: 8, reward: { min: 250, max: 600 }, xp: 25, avatar: 'https://i.imgur.com/8RQGfHJ.png', emoji: '🐺' },
    { name: 'Skeleton', hp: 70, damage: 20, defense: 10, reward: { min: 300, max: 700 }, xp: 30, avatar: 'https://i.imgur.com/tNZkELQ.png', emoji: '💀' }
  ],
  medieval: [
    { name: 'Rytíř', hp: 100, damage: 30, defense: 20, reward: { min: 500, max: 1000 }, xp: 50, avatar: 'https://i.imgur.com/pQN1vqm.png', emoji: '🛡️' },
    { name: 'Drak', hp: 150, damage: 40, defense: 25, reward: { min: 800, max: 1500 }, xp: 80, avatar: 'https://i.imgur.com/5xJ8Gch.png', emoji: '🐉' },
    { name: 'Troll', hp: 120, damage: 35, defense: 22, reward: { min: 600, max: 1200 }, xp: 60, avatar: 'https://i.imgur.com/kR9Lq2m.png', emoji: '👺' }
  ],
  renaissance: [
    { name: 'Mušketýr', hp: 130, damage: 45, defense: 28, reward: { min: 1000, max: 2000 }, xp: 100, avatar: 'https://i.imgur.com/jH3Xp8K.png', emoji: '🔫' },
    { name: 'Alchymista', hp: 110, damage: 50, defense: 30, reward: { min: 1200, max: 2200 }, xp: 110, avatar: 'https://i.imgur.com/9Lm4KpT.png', emoji: '🧪' },
    { name: 'Inkvizitor', hp: 140, damage: 48, defense: 32, reward: { min: 1100, max: 2100 }, xp: 105, avatar: 'https://i.imgur.com/2RqN7Hm.png', emoji: '⚖️' }
  ],
  modern: [
    { name: 'Válečník', hp: 180, damage: 60, defense: 40, reward: { min: 2000, max: 3500 }, xp: 150, avatar: 'https://i.imgur.com/vP4Qm2L.png', emoji: '🎖️' },
    { name: 'Sniper', hp: 160, damage: 70, defense: 35, reward: { min: 2500, max: 4000 }, xp: 170, avatar: 'https://i.imgur.com/8Kp3NqR.png', emoji: '🎯' },
    { name: 'Tank', hp: 220, damage: 55, defense: 50, reward: { min: 2200, max: 3800 }, xp: 160, avatar: 'https://i.imgur.com/4Hn9RpQ.png', emoji: '🚜' }
  ],
  futuristic: [
    { name: 'Cyborg', hp: 250, damage: 80, defense: 60, reward: { min: 4000, max: 6000 }, xp: 200, avatar: 'https://i.imgur.com/3Mp7QnK.png', emoji: '🤖' },
    { name: 'AI Robot', hp: 280, damage: 90, defense: 65, reward: { min: 5000, max: 7000 }, xp: 250, avatar: 'https://i.imgur.com/7Kq2NpM.png', emoji: '🦾' },
    { name: 'Alien', hp: 300, damage: 100, defense: 70, reward: { min: 6000, max: 8000 }, xp: 300, avatar: 'https://i.imgur.com/5Rn8MpL.png', emoji: '👽' }
  ]
};

export default {
  data: new SlashCommandBuilder()
    .setName('expedition')
    .setDescription('Vydej se na válečnou výpravu proti příšerám'),
  
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

      // Výpočet statistik hráče
      const playerStats = calculateStats(user);
      const realm = user.realm || 'ancient';
      
      // Výběr náhodné příšery z říše
      const monsters = MONSTERS[realm];
      const monster = monsters[Math.floor(Math.random() * monsters.length)];

      // Animace přípravy
      const preparing = new EmbedBuilder()
        .setColor(0x95A5A6)
        .setTitle('⚔️ Expedice')
        .setDescription(`\`\`\`\nPřipravuješ se na výpravu...\n\`\`\``)
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [preparing], fetchReply: true });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Karta představení nepřítele
      const encounterEmbed = new EmbedBuilder()
        .setColor(0xFF6347)
        .setTitle('⚔️ SETKÁNÍ S NEPŘÍTELEM!')
        .setDescription(
          `╔═══════════════════════════════╗\n` +
          `║     OBJEVIL JSI PŘÍŠERU!     ║\n` +
          `╚═══════════════════════════════╝`
        )
        .addFields(
          { 
            name: `👤 ${interaction.user.username}`,
            value: 
              `💥 DMG: ${playerStats.damage}\n` +
              `🛡️ DEF: ${playerStats.defense}\n` +
              `❤️ HP: ${playerStats.hp}`,
            inline: true 
          },
          { name: '\u200b', value: '**VS**', inline: true },
          { 
            name: `${monster.emoji} ${monster.name}`,
            value: 
              `💥 DMG: ${monster.damage}\n` +
              `🛡️ DEF: ${monster.defense}\n` +
              `❤️ HP: ${monster.hp}`,
            inline: true 
          }
        )
        .setThumbnail(interaction.user.displayAvatarURL())
        .setImage(monster.avatar)
        .setTimestamp();

      await msg.edit({ embeds: [encounterEmbed] });
      await new Promise(resolve => setTimeout(resolve, 2500));

      // Simulace boje s real-time updates
      const battleResult = await simulateBattleWithUpdates(playerStats, monster, msg, interaction, user);

      const playerHp = battleResult.playerHp;
      const playerDamageTaken = battleResult.playerDamageTaken;

      // Výsledek
      if (playerHp > 0) {
        // Výhra
        const reward = Math.floor(Math.random() * (monster.reward.max - monster.reward.min + 1)) + monster.reward.min;
        const xpGained = monster.xp;

        // Aktualizace hráče
        await db.query(
          'UPDATE users SET money = money + $1, xp = xp + $2, wins = wins + 1, potion = NULL WHERE id = $3',
          [reward, xpGained, userId]
        );

        // Level up check
        const newXp = user.xp + xpGained;
        let finalLevel = user.level;
        if (newXp >= 100) {
          finalLevel = user.level + Math.floor(newXp / 100);
          const remainingXp = newXp % 100;
          
          await db.query(
            'UPDATE users SET level = $1, xp = $2 WHERE id = $3',
            [finalLevel, remainingXp, userId]
          );

          battleLog += `\n🎉 LEVEL UP! Jsi nyní level ${finalLevel}!`;
        }

        // Kontrola realm progressu
        const realmProgress = await checkRealmProgression(db, userId, finalLevel, user.realm);

        // Snížení durability vybavení podle damage
        const durabilityLoss = Math.ceil(playerDamageTaken / 10);

        await db.query(`
          UPDATE users 
          SET 
            weapon_durability = GREATEST(0, COALESCE(weapon_durability, 100) - $1),
            helmet_durability = GREATEST(0, COALESCE(helmet_durability, 100) - $1),
            armor_durability = GREATEST(0, COALESCE(armor_durability, 100) - $1),
            boots_durability = GREATEST(0, COALESCE(boots_durability, 100) - $1)
          WHERE id = $2
        `, [durabilityLoss, userId]);

        const embed = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('🏆 VÝHRA!')
          .setDescription(
            `╔═══════════════════════════════╗\n` +
            `║     VÍTĚZSTVÍ V BITVĚ!       ║\n` +
            `╚═══════════════════════════════╝\n\n` +
            `Porazil jsi **${monster.emoji} ${monster.name}**!`
          )
          .addFields(
            { name: '💰 Odměna', value: `${reward.toLocaleString()} Kč`, inline: true },
            { name: '⭐ XP získáno', value: `+${xpGained}`, inline: true },
            { name: '❤️ Zbývá HP', value: `${playerHp}/${playerStats.hp}`, inline: true },
            { 
              name: '📊 Bojové statistiky', 
              value: `${playerDamageTaken} DMG přijato | -${durabilityLoss}% durability`, 
              inline: false 
            }
          )
          .setThumbnail(interaction.user.displayAvatarURL())
          .setFooter({ text: realmProgress.advanced ? `${realmProgress.emoji} Postupuješ do ${realmProgress.name}!` : 'Můžeš jít na další expedici!' })
          .setTimestamp();

        await msg.edit({ embeds: [embed] });

      } else {
        // Prohra
        const penalty = Math.floor(user.money * 0.1); // 10% pokuta
        const durabilityLoss = Math.ceil(playerDamageTaken / 10);

        await db.query(
          'UPDATE users SET money = money - $1, losses = losses + 1, potion = NULL WHERE id = $2',
          [penalty, userId]
        );

        // Snížení durability i při prohře
        await db.query(`
          UPDATE users 
          SET 
            weapon_durability = GREATEST(0, COALESCE(weapon_durability, 100) - $1),
            helmet_durability = GREATEST(0, COALESCE(helmet_durability, 100) - $1),
            armor_durability = GREATEST(0, COALESCE(armor_durability, 100) - $1),
            boots_durability = GREATEST(0, COALESCE(boots_durability, 100) - $1)
          WHERE id = $2
        `, [durabilityLoss, userId]);

        const embed = new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('💀 PROHRA')
          .setDescription(
            `╔═══════════════════════════════╗\n` +
            `║        PADL JSI V BOJI!      ║\n` +
            `╚═══════════════════════════════╝\n\n` +
            `Byl jsi poražen **${monster.emoji} ${monster.name}**!`
          )
          .addFields(
            { name: '💸 Pokuta', value: `-${penalty.toLocaleString()} Kč`, inline: true },
            { name: '❤️ HP', value: `0/${playerStats.hp}`, inline: true },
            { name: '📊 Statistiky', value: `${playerDamageTaken} DMG přijato | -${durabilityLoss}% durability`, inline: false }
          )
          .setThumbnail(monster.avatar)
          .setFooter({ text: 'Příště to zvládneš!' })
          .setTimestamp();

        await msg.edit({ embeds: [embed] });
      }

    } catch (error) {
      console.error('Expedition error:', error);
      throw error;
    }
  }
};

// Výpočet statistik hráče
function calculateStats(userData) {
  let damage = 20;
  let defense = 10;
  let hp = 100;

  if (userData.weapon) {
    const weapon = SHOP_ITEMS[userData.weapon];
    if (weapon && weapon.damage) damage += weapon.damage;
  }

  if (userData.helmet) {
    const helmet = SHOP_ITEMS[userData.helmet];
    if (helmet && helmet.defense) defense += helmet.defense;
  }

  if (userData.armor) {
    const armor = SHOP_ITEMS[userData.armor];
    if (armor && armor.defense) defense += armor.defense;
  }

  if (userData.boots) {
    const boots = SHOP_ITEMS[userData.boots];
    if (boots && boots.defense) defense += boots.defense;
  }

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

// Simulace boje s real-time updates
async function simulateBattleWithUpdates(playerStats, monster, msg, interaction, user) {
  let playerHp = playerStats.hp;
  let monsterHp = monster.hp;
  const maxPlayerHp = playerStats.hp;
  const maxMonsterHp = monster.hp;

  let round = 0;
  let playerDamageTaken = 0;
  let totalXpGained = 0;

  while (playerHp > 0 && monsterHp > 0 && round < 20) {
    round++;

    // Hráč útočí
    const playerDamage = Math.max(1, playerStats.damage - Math.floor(monster.defense / 2));
    monsterHp -= playerDamage;
    
    // XP za každý útok (malé množství pro real-time zobrazení)
    const roundXp = Math.floor(monster.xp / 10);
    totalXpGained += roundXp;

    // Update embed po útoku hráče
    const battleEmbed = new EmbedBuilder()
      .setColor(0x3498DB)
      .setTitle(`⚔️ EXPEDICE - KOLO ${round}`)
      .setDescription(
        `╔═══════════════════════════════╗\n` +
        `║       PROBÍHÁ SOUBOJ!        ║\n` +
        `╚═══════════════════════════════╝`
      )
      .addFields(
        { 
          name: `👤 ${interaction.user.username}`,
          value: 
            `❤️ HP: ${Math.max(0, playerHp)}/${maxPlayerHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((playerHp / maxPlayerHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((playerHp / maxPlayerHp) * 10)))}\n` +
            `🗡️ Útočíš: **${playerDamage} DMG**\n` +
            `⭐ XP: +${totalXpGained}`,
          inline: true 
        },
        { name: '\u200b', value: '**VS**', inline: true },
        { 
          name: `${monster.emoji} ${monster.name}`,
          value: 
            `❤️ HP: ${Math.max(0, monsterHp)}/${maxMonsterHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((monsterHp / maxMonsterHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((monsterHp / maxMonsterHp) * 10)))}\n` +
            `💥 Přijal: **-${playerDamage} HP**`,
          inline: true 
        }
      )
      .setThumbnail(interaction.user.displayAvatarURL())
      .setImage(monster.avatar)
      .setTimestamp();

    await msg.edit({ embeds: [battleEmbed] });
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (monsterHp <= 0) break;

    // Příšera útočí
    const monsterDamage = Math.max(1, monster.damage - Math.floor(playerStats.defense / 2));
    playerHp -= monsterDamage;
    playerDamageTaken += monsterDamage;

    // Update embed po útoku příšery
    const battleEmbed2 = new EmbedBuilder()
      .setColor(0xFF6347)
      .setTitle(`⚔️ EXPEDICE - KOLO ${round}`)
      .setDescription(
        `╔═══════════════════════════════╗\n` +
        `║       PROBÍHÁ SOUBOJ!        ║\n` +
        `╚═══════════════════════════════╝`
      )
      .addFields(
        { 
          name: `👤 ${interaction.user.username}`,
          value: 
            `❤️ HP: ${Math.max(0, playerHp)}/${maxPlayerHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((playerHp / maxPlayerHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((playerHp / maxPlayerHp) * 10)))}\n` +
            `💥 Přijal: **-${monsterDamage} HP**\n` +
            `⭐ XP: +${totalXpGained}`,
          inline: true 
        },
        { name: '\u200b', value: '**VS**', inline: true },
        { 
          name: `${monster.emoji} ${monster.name}`,
          value: 
            `❤️ HP: ${Math.max(0, monsterHp)}/${maxMonsterHp}\n` +
            `${'█'.repeat(Math.max(0, Math.floor((monsterHp / maxMonsterHp) * 10)))}${'░'.repeat(Math.max(0, 10 - Math.floor((monsterHp / maxMonsterHp) * 10)))}\n` +
            `🗡️ Útočí: **${monsterDamage} DMG**`,
          inline: true 
        }
      )
      .setThumbnail(monster.avatar)
      .setImage(interaction.user.displayAvatarURL())
      .setTimestamp();

    await msg.edit({ embeds: [battleEmbed2] });
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  return {
    playerHp: playerHp,
    playerDamageTaken: playerDamageTaken
  };
}
