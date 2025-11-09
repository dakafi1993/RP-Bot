import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Definice všech itemů v shopu
export const SHOP_ITEMS = {
  // Boosters
  work_boost: { name: '🔧 Work Boost', price: 5000, category: 'boost', description: '2x výdělek z /work na 7 dní' },
  rob_protection: { name: '🛡️ Rob Protection', price: 3000, category: 'boost', description: 'Ochrana před /rob na 5 dní' },
  
  // Krumpáče  
  wooden_pickaxe: { name: '🪵 Dřevěný krumpáč', price: 500, category: 'pickaxe', description: 'Základní krumpáč (1x použití)' },
  
  // Zbraně
  wooden_sword: { name: '🗡️ Dřevěný meč', price: 1000, category: 'weapon', damage: 10, description: 'Základní zbraň (+10 DMG)' },
  iron_sword: { name: '⚔️ Železný meč', price: 5000, category: 'weapon', damage: 25, description: 'Silná zbraň (+25 DMG)' },
  diamond_sword: { name: '💎 Diamantový meč', price: 25000, category: 'weapon', damage: 50, description: 'Legendární zbraň (+50 DMG)' },
  
  // Helmy
  leather_helmet: { name: '🧢 Kožená helma', price: 800, category: 'helmet', defense: 5, description: 'Lehká ochrana (+5 DEF)' },
  iron_helmet: { name: '⚙️ Železná helma', price: 3000, category: 'helmet', defense: 15, description: 'Pevná ochrana (+15 DEF)' },
  diamond_helmet: { name: '💎 Diamantová helma', price: 15000, category: 'helmet', defense: 30, description: 'Maximální ochrana (+30 DEF)' },
  
  // Brnění
  leather_armor: { name: '🦺 Kožené brnění', price: 1500, category: 'armor', defense: 10, description: 'Základní obrana (+10 DEF)' },
  iron_armor: { name: '🛡️ Železné brnění', price: 6000, category: 'armor', defense: 25, description: 'Pevná obrana (+25 DEF)' },
  diamond_armor: { name: '💠 Diamantové brnění', price: 30000, category: 'armor', defense: 50, description: 'Neprůstřelná obrana (+50 DEF)' },
  
  // Boty
  leather_boots: { name: '👟 Kožené boty', price: 600, category: 'boots', defense: 3, description: 'Rychlé boty (+3 DEF)' },
  iron_boots: { name: '🥾 Železné boty', price: 2500, category: 'boots', defense: 10, description: 'Odolné boty (+10 DEF)' },
  diamond_boots: { name: '👢 Diamantové boty', price: 12000, category: 'boots', defense: 20, description: 'Mistrné boty (+20 DEF)' },
  
  // Lektvary
  health_potion: { name: '❤️ Lektvar zdraví', price: 500, category: 'potion', effect: 'heal_50', description: 'Vyléčí 50 HP v boji' },
  strength_potion: { name: '💪 Lektvar síly', price: 1000, category: 'potion', effect: 'damage_20', description: '+20% DMG v dalším boji' },
  defense_potion: { name: '🛡️ Lektvar obrany', price: 1000, category: 'potion', effect: 'defense_20', description: '+20% DEF v dalším boji' },
};

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Obchod s vybavením')
    .addStringOption(option =>
      option.setName('category')
        .setDescription('Kategorie')
        .setRequired(false)
        .addChoices(
          { name: '⚔️ Zbraně', value: 'weapon' },
          { name: '🛡️ Brnění & Helmy', value: 'armor' },
          { name: '👟 Boty', value: 'boots' },
          { name: '🧪 Lektvary', value: 'potion' },
          { name: '⛏️ Krumpáče', value: 'pickaxe' },
          { name: '✨ Boosters', value: 'boost' }
        )
    )
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Zadej klíč itemu (např. iron_sword)')
        .setRequired(false)
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const category = interaction.options.getString('category');
    const itemKey = interaction.options.getString('item');

    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Nákup itemu
      if (itemKey) {
        const item = SHOP_ITEMS[itemKey];
        
        if (!item) {
          return interaction.reply({
            content: '❌ Tento item neexistuje! Použij `/shop category:[kategorie]` pro zobrazení itemů.',
            ephemeral: true
          });
        }

        // Kontrola peněz
        if (user.money < item.price) {
          return interaction.reply({
            content: `❌ Nemáš dost peněz! **${item.name}** stojí **${item.price.toLocaleString()} Kč**.\nMáš pouze **${user.money.toLocaleString()} Kč**.`,
            ephemeral: true
          });
        }

        // Nákup podle kategorie
        if (item.category === 'boost') {
          // Boosters (work_boost, rob_protection)
          const now = Date.now();
          const days = itemKey === 'work_boost' ? 7 : 5;
          const columnName = itemKey;
          
          await db.query(
            `UPDATE users SET money = money - $1, ${columnName} = $2 WHERE id = $3`,
            [item.price, now + (days * 24 * 60 * 60 * 1000), userId]
          );

          const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Nákup úspěšný!')
            .setDescription(`Koupil jsi **${item.name}**!\n\n📋 ${item.description}`)
            .addFields(
              { name: '💰 Zaplaceno', value: `${item.price.toLocaleString()} Kč`, inline: true },
              { name: '💵 Zbývá', value: `${(user.money - item.price).toLocaleString()} Kč`, inline: true }
            );

          return interaction.reply({ embeds: [embed] });
        }
        
        if (item.category === 'pickaxe') {
          // Krumpáč - nastav wooden + durability 100
          await db.query(
            'UPDATE users SET money = money - $1, pickaxe = $2, pickaxe_durability = 100 WHERE id = $3',
            [item.price, 'wooden', userId]
          );

          const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Nákup úspěšný!')
            .setDescription(`Koupil jsi **${item.name}**!\n\n📋 ${item.description}`)
            .addFields(
              { name: '💰 Zaplaceno', value: `${item.price.toLocaleString()} Kč`, inline: true },
              { name: '💵 Zbývá', value: `${(user.money - item.price).toLocaleString()} Kč`, inline: true }
            );

          return interaction.reply({ embeds: [embed] });
        }

        if (['weapon', 'helmet', 'armor', 'boots', 'potion'].includes(item.category)) {
          // Vybavení - ulož do inventáře + nastav plnou durability
          const columnName = item.category;
          const durabilityColumn = `${columnName}_durability`;
          
          // Pro lektvary durability neřešíme
          if (item.category === 'potion') {
            await db.query(
              `UPDATE users SET money = money - $1, ${columnName} = $2 WHERE id = $3`,
              [item.price, itemKey, userId]
            );
          } else {
            // Pro weapon/helmet/armor/boots nastavíme durability na 100
            await db.query(
              `UPDATE users SET money = money - $1, ${columnName} = $2, ${durabilityColumn} = 100 WHERE id = $3`,
              [item.price, itemKey, userId]
            );
          }

          const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Nákup úspěšný!')
            .setDescription(
              `Koupil jsi **${item.name}**!\n\n` +
              `📋 ${item.description}\n` +
              `💡 Item je automaticky nasazen!`
            )
            .addFields(
              { name: '💰 Zaplaceno', value: `${item.price.toLocaleString()} Kč`, inline: true },
              { name: '💵 Zbývá', value: `${(user.money - item.price).toLocaleString()} Kč`, inline: true }
            );

          return interaction.reply({ embeds: [embed] });
        }
      }

      // Zobrazení kategorie
      if (category) {
        let categoryItems;
        if (category === 'armor') {
          // Pro armor zobraz helmy i brnění
          categoryItems = Object.entries(SHOP_ITEMS).filter(([key, item]) => 
            item.category === 'armor' || item.category === 'helmet'
          );
        } else {
          categoryItems = Object.entries(SHOP_ITEMS).filter(([key, item]) => item.category === category);
        }
        
        if (categoryItems.length === 0) {
          return interaction.reply({
            content: '❌ V této kategorii nejsou žádné itemy!',
            ephemeral: true
          });
        }

        const categoryNames = {
          weapon: '⚔️ Zbraně',
          armor: '🛡️ Brnění & Helmy',
          boots: '👟 Boty',
          potion: '🧪 Lektvary',
          pickaxe: '⛏️ Krumpáče',
          boost: '✨ Boosters'
        };

        let itemsList = '';
        categoryItems.forEach(([key, item]) => {
          itemsList += `**${item.name}** - ${item.price.toLocaleString()} Kč\n${item.description}\n\`/shop item:${key}\`\n\n`;
        });

        const embed = new EmbedBuilder()
          .setColor(0xFF6B35)
          .setTitle(`🏪 ${categoryNames[category]}`)
          .setDescription(itemsList)
          .setFooter({ text: `Tvé peníze: ${user.money.toLocaleString()} Kč | Pro nákup: /shop item:[klíč]` });

        return interaction.reply({ embeds: [embed], ephemeral: false });
      }

      // Hlavní menu shopu
      const embed = new EmbedBuilder()
        .setColor(0xFF6B35)
        .setTitle('🏪 Obchod')
        .setDescription(
          'Vítej v obchodě! Vyber si kategorii:\n\n' +
          '⚔️ **Zbraně** - `/shop category:weapon`\n' +
          '🛡️ **Brnění & Helmy** - `/shop category:armor`\n' +
          '👟 **Boty** - `/shop category:boots`\n' +
          '🧪 **Lektvary** - `/shop category:potion`\n' +
          '⛏️ **Krumpáče** - `/shop category:pickaxe`\n' +
          '✨ **Boosters** - `/shop category:boost`'
        )
        .setFooter({ text: `Tvé peníze: ${user.money.toLocaleString()} Kč` })
        .setTimestamp();

      await interaction.reply({ embeds: [embed], ephemeral: false });

    } catch (error) {
      console.error('Shop error:', error);
      throw error;
    }
  }
};
