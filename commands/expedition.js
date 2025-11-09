import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SHOP_ITEMS } from './shop.js';
import { checkRealmProgression } from '../utils/realm-progression.js';

// Příšery podle říše
const MONSTERS = {
  ancient: [
    { name: 'Goblin', hp: 50, damage: 15, defense: 5, reward: { min: 200, max: 500 }, xp: 20 },
    { name: 'Vlk', hp: 60, damage: 18, defense: 8, reward: { min: 250, max: 600 }, xp: 25 },
    { name: 'Skeleton', hp: 70, damage: 20, defense: 10, reward: { min: 300, max: 700 }, xp: 30 }
  ],
  medieval: [
    { name: 'Rytíř', hp: 100, damage: 30, defense: 20, reward: { min: 500, max: 1000 }, xp: 50 },
    { name: 'Drak', hp: 150, damage: 40, defense: 25, reward: { min: 800, max: 1500 }, xp: 80 },
    { name: 'Troll', hp: 120, damage: 35, defense: 22, reward: { min: 600, max: 1200 }, xp: 60 }
  ],
  renaissance: [
    { name: 'Mušketýr', hp: 130, damage: 45, defense: 28, reward: { min: 1000, max: 2000 }, xp: 100 },
    { name: 'Alchymista', hp: 110, damage: 50, defense: 30, reward: { min: 1200, max: 2200 }, xp: 110 },
    { name: 'Inkvizitor', hp: 140, damage: 48, defense: 32, reward: { min: 1100, max: 2100 }, xp: 105 }
  ],
  modern: [
    { name: 'Válečník', hp: 180, damage: 60, defense: 40, reward: { min: 2000, max: 3500 }, xp: 150 },
    { name: 'Sniper', hp: 160, damage: 70, defense: 35, reward: { min: 2500, max: 4000 }, xp: 170 },
    { name: 'Tank', hp: 220, damage: 55, defense: 50, reward: { min: 2200, max: 3800 }, xp: 160 }
  ],
  futuristic: [
    { name: 'Cyborg', hp: 250, damage: 80, defense: 60, reward: { min: 4000, max: 6000 }, xp: 200 },
    { name: 'AI Robot', hp: 280, damage: 90, defense: 65, reward: { min: 5000, max: 7000 }, xp: 250 },
    { name: 'Alien', hp: 300, damage: 100, defense: 70, reward: { min: 6000, max: 8000 }, xp: 300 }
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

      // Simulace boje
      let playerHp = playerStats.hp;
      let monsterHp = monster.hp;
      let battleLog = '';
      let round = 0;
      let playerDamageTaken = 0;

      while (playerHp > 0 && monsterHp > 0 && round < 20) {
        round++;

        // Hráč útočí
        const playerDamage = Math.max(1, playerStats.damage - Math.floor(monster.defense / 2));
        monsterHp -= playerDamage;
        battleLog += `⚔️ Tvůj útok: ${playerDamage} DMG\n`;

        if (monsterHp <= 0) break;

        // Příšera útočí
        const monsterDamage = Math.max(1, monster.damage - Math.floor(playerStats.defense / 2));
        playerHp -= monsterDamage;
        playerDamageTaken += monsterDamage;
        battleLog += `💥 ${monster.name}: ${monsterDamage} DMG\n`;
      }

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
            `Porazil jsi **${monster.name}**!\n\n` +
            `**📜 Průběh boje:**\n\`\`\`\n${battleLog}\`\`\`\n` +
            `💰 **Odměna:** ${reward.toLocaleString()} Kč\n` +
            `⭐ **XP:** +${xpGained}\n` +
            `❤️ **Zbývá HP:** ${playerHp}\n` +
            `📊 **Statistiky:** ${playerDamageTaken} DMG přijato | -${durabilityLoss} durability` +
            (realmProgress.advanced ? `\n\n${realmProgress.emoji} **Postupuješ do ${realmProgress.name}!**` : '')
          )
          .setFooter({ text: 'Můžeš jít na další expedici!' });

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
            `Byl jsi poražen **${monster.name}**!\n\n` +
            `**📜 Průběh boje:**\n\`\`\`\n${battleLog}\`\`\`\n` +
            `💸 **Pokuta:** -${penalty.toLocaleString()} Kč\n` +
            `❤️ **Zbývá HP:** 0\n` +
            `📊 **Statistiky:** ${playerDamageTaken} DMG přijato | -${durabilityLoss} durability`
          )
          .setFooter({ text: 'Příště to zvládneš!' });

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
