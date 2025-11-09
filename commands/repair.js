import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Ceny oprav
const REPAIR_COSTS = {
  pickaxe: { iron: 2000, diamond: 10000, legendary: 15000 },
  weapon: 1000,
  helmet: 800,
  armor: 1500,
  boots: 600
};

export default {
  data: new SlashCommandBuilder()
    .setName('repair')
    .setDescription('Oprav svoje vybavení')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Co chceš opravit')
        .setRequired(true)
        .addChoices(
          { name: '⛏️ Krumpáč', value: 'pickaxe' },
          { name: '⚔️ Zbraň', value: 'weapon' },
          { name: '🪖 Helmu', value: 'helmet' },
          { name: '🛡️ Brnění', value: 'armor' },
          { name: '👢 Boty', value: 'boots' },
          { name: '🔧 Vše', value: 'all' }
        )
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const itemType = interaction.options.getString('item');

    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Repair all items
      if (itemType === 'all') {
        let totalCost = 0;
        let repairs = [];

        // Pickaxe
        if (user.pickaxe && user.pickaxe !== 'wooden' && (user.pickaxe_durability || 0) < 100) {
          const cost = REPAIR_COSTS.pickaxe[user.pickaxe] || 0;
          totalCost += cost;
          repairs.push(`⛏️ Krumpáč: ${cost} Kč`);
        }

        // Weapon
        if (user.weapon && (user.weapon_durability || 0) < 100) {
          totalCost += REPAIR_COSTS.weapon;
          repairs.push(`⚔️ Zbraň: ${REPAIR_COSTS.weapon} Kč`);
        }

        // Helmet
        if (user.helmet && (user.helmet_durability || 0) < 100) {
          totalCost += REPAIR_COSTS.helmet;
          repairs.push(`🪖 Helma: ${REPAIR_COSTS.helmet} Kč`);
        }

        // Armor
        if (user.armor && (user.armor_durability || 0) < 100) {
          totalCost += REPAIR_COSTS.armor;
          repairs.push(`🛡️ Brnění: ${REPAIR_COSTS.armor} Kč`);
        }

        // Boots
        if (user.boots && (user.boots_durability || 0) < 100) {
          totalCost += REPAIR_COSTS.boots;
          repairs.push(`👢 Boty: ${REPAIR_COSTS.boots} Kč`);
        }

        if (repairs.length === 0) {
          return interaction.reply({
            content: '✅ Veškeré tvoje vybavení je v perfektním stavu!',
            ephemeral: true
          });
        }

        if (user.money < totalCost) {
          return interaction.reply({
            content: `❌ Nemáš dostatek peněz! Celková cena opravy: ${totalCost.toLocaleString()} Kč (máš ${user.money.toLocaleString()} Kč)`,
            ephemeral: true
          });
        }

        await db.query(`
          UPDATE users 
          SET 
            money = money - $1,
            pickaxe_durability = CASE WHEN pickaxe IS NOT NULL AND pickaxe != 'wooden' THEN 100 ELSE pickaxe_durability END,
            weapon_durability = CASE WHEN weapon IS NOT NULL THEN 100 ELSE weapon_durability END,
            helmet_durability = CASE WHEN helmet IS NOT NULL THEN 100 ELSE helmet_durability END,
            armor_durability = CASE WHEN armor IS NOT NULL THEN 100 ELSE armor_durability END,
            boots_durability = CASE WHEN boots IS NOT NULL THEN 100 ELSE boots_durability END
          WHERE id = $2
        `, [totalCost, userId]);

        const embed = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('🔧 Oprava kompletní!')
          .setDescription('Veškeré tvoje vybavení bylo opraveno!')
          .addFields(
            { name: 'Opraveno', value: repairs.join('\n'), inline: false },
            { name: 'Celková cena', value: `${totalCost.toLocaleString()} Kč`, inline: true },
            { name: 'Zbývá', value: `${(user.money - totalCost).toLocaleString()} Kč`, inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      // Repair single item - Pickaxe
      if (itemType === 'pickaxe') {
        const pickaxe = user.pickaxe || 'wooden';
        const durability = user.pickaxe_durability || 100;

        if (pickaxe === 'wooden') {
          return interaction.reply({
            content: '❌ Dřevěný krumpáč se nedá opravit! Kup si nový v `/shop`.',
            ephemeral: true
          });
        }

        if (durability >= 100) {
          return interaction.reply({
            content: '✅ Tvůj krumpáč je v perfektním stavu!',
            ephemeral: true
          });
        }

        const repairCost = REPAIR_COSTS.pickaxe[pickaxe];
        const pickaxeNames = {
          iron: '⚙️ Železný krumpáč',
          diamond: '💎 Diamantový krumpáč',
          legendary: '🌟 Legendární krumpáč'
        };

        if (user.money < repairCost) {
          return interaction.reply({
            content: `❌ Nemáš dostatek peněz! Oprava stojí ${repairCost.toLocaleString()} Kč, ale máš pouze ${user.money.toLocaleString()} Kč.`,
            ephemeral: true
          });
        }

        await db.query('UPDATE users SET money = money - $1, pickaxe_durability = 100 WHERE id = $2', [repairCost, userId]);

        const embed = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('🔧 Oprava dokončena!')
          .setDescription(`${pickaxeNames[pickaxe]} byl opraven!`)
          .addFields(
            { name: 'Cena', value: `${repairCost.toLocaleString()} Kč`, inline: true },
            { name: 'Zbývá', value: `${(user.money - repairCost).toLocaleString()} Kč`, inline: true },
            { name: 'Durability', value: `${durability}% → 100%`, inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed] });
      }

      // Equipment repair
      const equipmentConfig = {
        weapon: { name: '⚔️ Zbraň', column: 'weapon', durabilityColumn: 'weapon_durability', cost: REPAIR_COSTS.weapon },
        helmet: { name: '🪖 Helma', column: 'helmet', durabilityColumn: 'helmet_durability', cost: REPAIR_COSTS.helmet },
        armor: { name: '🛡️ Brnění', column: 'armor', durabilityColumn: 'armor_durability', cost: REPAIR_COSTS.armor },
        boots: { name: '👢 Boty', column: 'boots', durabilityColumn: 'boots_durability', cost: REPAIR_COSTS.boots }
      };

      const config = equipmentConfig[itemType];
      if (!config) {
        return interaction.reply({ content: '❌ Neplatný typ vybavení!', ephemeral: true });
      }

      const hasItem = user[config.column];
      const durability = user[config.durabilityColumn] || 100;

      if (!hasItem) {
        return interaction.reply({
          content: `❌ Nemáš ${config.name}!`,
          ephemeral: true
        });
      }

      if (durability >= 100) {
        return interaction.reply({
          content: `✅ ${config.name} je v perfektním stavu!`,
          ephemeral: true
        });
      }

      if (user.money < config.cost) {
        return interaction.reply({
          content: `❌ Nemáš dostatek peněz! Oprava stojí ${config.cost.toLocaleString()} Kč, ale máš pouze ${user.money.toLocaleString()} Kč.`,
          ephemeral: true
        });
      }

      await db.query(
        `UPDATE users SET money = money - $1, ${config.durabilityColumn} = 100 WHERE id = $2`,
        [config.cost, userId]
      );

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('🔧 Oprava dokončena!')
        .setDescription(`${config.name} bylo opraveno!`)
        .addFields(
          { name: 'Cena', value: `${config.cost.toLocaleString()} Kč`, inline: true },
          { name: 'Zbývá', value: `${(user.money - config.cost).toLocaleString()} Kč`, inline: true },
          { name: 'Durability', value: `${durability}% → 100%`, inline: true }
        )
        .setTimestamp();

      return interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Repair command error:', error);
      throw error;
    }
  }
};
