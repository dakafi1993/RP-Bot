import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Aktivní aukce
const activeAuctions = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('auction')
    .setDescription('Aukce kovů a vybavení mezi hráči')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Vytvoř aukci')
        .addStringOption(option =>
          option.setName('type')
            .setDescription('Co chceš prodat?')
            .setRequired(true)
            .addChoices(
              { name: '📦 Kovy', value: 'ore' },
              { name: '⚔️ Vybavení', value: 'equipment' }
            )
        )
        .addStringOption(option =>
          option.setName('ore')
            .setDescription('Který kov? (pouze pro typ "Kovy")')
            .setRequired(false)
            .addChoices(
              { name: '⚙️ Železo', value: 'iron' },
              { name: '🟠 Měď', value: 'copper' },
              { name: '🟡 Zlato', value: 'gold' },
              { name: '💎 Diamant', value: 'diamond' }
            )
        )
        .addStringOption(option =>
          option.setName('equipment')
            .setDescription('Které vybavení? (pouze pro typ "Vybavení")')
            .setRequired(false)
            .addChoices(
              { name: '⚔️ Zbraň', value: 'weapon' },
              { name: '⛑️ Helma', value: 'helmet' },
              { name: '🛡️ Brnění', value: 'armor' },
              { name: '👟 Boty', value: 'boots' }
            )
        )
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Kolik kusů? (pouze pro kovy)')
            .setRequired(false)
            .setMinValue(1)
        )
        .addIntegerOption(option =>
          option.setName('price')
            .setDescription('Cena (za kus u kovů, celková u vybavení)')
            .setRequired(true)
            .setMinValue(10)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('Zobraz aktivní aukce')
    ),
  
  async execute(interaction, db) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'create') {
      await handleCreateAuction(interaction, db);
    } else if (subcommand === 'list') {
      await handleListAuctions(interaction);
    }
  }
};

async function handleCreateAuction(interaction, db) {
  const userId = interaction.user.id;
  const auctionType = interaction.options.getString('type');
  const price = interaction.options.getInteger('price');

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return interaction.reply({ 
        content: 'Ještě nemáš postavu!', 
        ephemeral: true 
      });
    }

    if (auctionType === 'ore') {
      // Aukce kovů
      const oreType = interaction.options.getString('ore');
      const amount = interaction.options.getInteger('amount');

      if (!oreType || !amount) {
        return interaction.reply({
          content: '❌ Pro aukci kovů musíš zadat typ kovu a množství!',
          ephemeral: true
        });
      }

      // Kontrola zda má dostatek kovů
      if (user[oreType] < amount) {
        return interaction.reply({
          content: `❌ Nemáš dostatek kovů! Máš jen **${user[oreType]}x**.`,
          ephemeral: true
        });
      }

      // Odebrání kovů z inventáře
      await db.query(
        `UPDATE users SET ${oreType} = ${oreType} - $1 WHERE id = $2`,
        [amount, userId]
      );

      const oreNames = { iron: 'Železo', copper: 'Měď', gold: 'Zlato', diamond: 'Diamant' };
      const oreEmojis = { iron: '⚙️', copper: '🟠', gold: '🟡', diamond: '💎' };

      const auctionId = `${userId}-${Date.now()}`;
      const totalPrice = price * amount;

      activeAuctions.set(auctionId, {
        type: 'ore',
        sellerId: userId,
        sellerName: user.name,
        oreType,
        amount,
        pricePerOre: price,
        totalPrice
      });

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏛️ Nová aukce!')
        .setDescription(`**${user.name}** nabízí:`)
        .addFields(
          { name: '📦 Produkt', value: `${amount}x ${oreEmojis[oreType]} ${oreNames[oreType]}`, inline: true },
          { name: '💰 Cena/ks', value: `${price} Kč`, inline: true },
          { name: '💳 Celkem', value: `${totalPrice} Kč`, inline: true }
        )
        .setFooter({ text: `ID: ${auctionId}` })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`auction_buy_${auctionId}`)
            .setLabel('💰 Koupit')
            .setStyle(ButtonStyle.Success)
        );

      await interaction.reply({ embeds: [embed], components: [row] });

    } else if (auctionType === 'equipment') {
      // Aukce vybavení
      const equipmentType = interaction.options.getString('equipment');

      if (!equipmentType) {
        return interaction.reply({
          content: '❌ Pro aukci vybavení musíš zadat typ vybavení!',
          ephemeral: true
        });
      }

      // Kontrola zda má vybavení
      if (!user[equipmentType]) {
        return interaction.reply({
          content: `❌ Nemáš žádné ${equipmentType}!`,
          ephemeral: true
        });
      }

      // Import SHOP_ITEMS pro zobrazení názvu a statistik
      const { SHOP_ITEMS } = await import('./shop.js');
      const equipmentItem = SHOP_ITEMS[user[equipmentType]];
      const durabilityColumn = `${equipmentType}_durability`;
      const durability = user[durabilityColumn] || 100;

      // Odebrání vybavení z inventáře
      await db.query(
        `UPDATE users SET ${equipmentType} = NULL, ${durabilityColumn} = NULL WHERE id = $1`,
        [userId]
      );

      const equipmentNames = { 
        weapon: '⚔️ Zbraň', 
        helmet: '⛑️ Helma', 
        armor: '🛡️ Brnění', 
        boots: '👟 Boty' 
      };

      const auctionId = `${userId}-${Date.now()}`;

      activeAuctions.set(auctionId, {
        type: 'equipment',
        sellerId: userId,
        sellerName: user.name,
        equipmentType,
        equipmentId: user[equipmentType],
        durability,
        totalPrice: price
      });

      // Durability emoji
      const getDurabilityEmoji = (dur) => {
        if (dur >= 80) return '🟢';
        if (dur >= 50) return '🟡';
        if (dur >= 20) return '🟠';
        return '�';
      };

      const embed = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🏛️ Nová aukce!')
        .setDescription(`**${user.name}** nabízí:`)
        .addFields(
          { name: '📦 Produkt', value: `${equipmentNames[equipmentType]}: ${equipmentItem.name}`, inline: false },
          { name: '💥 Stats', value: equipmentItem.damage ? `+${equipmentItem.damage} DMG` : `+${equipmentItem.defense} DEF`, inline: true },
          { name: '🔧 Stav', value: `${getDurabilityEmoji(durability)} ${durability}%`, inline: true },
          { name: '💰 Cena', value: `${price} Kč`, inline: true }
        )
        .setFooter({ text: `ID: ${auctionId}` })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId(`auction_buy_${auctionId}`)
            .setLabel('💰 Koupit')
            .setStyle(ButtonStyle.Success)
        );

      await interaction.reply({ embeds: [embed], components: [row] });
    }
  } catch (error) {
    console.error('Auction create error:', error);
    throw error;
  }
}

async function handleListAuctions(interaction) {
  if (activeAuctions.size === 0) {
    return interaction.reply({
      content: '📭 Momentálně nejsou žádné aktivní aukce.',
      ephemeral: true
    });
  }

  const oreNames = { iron: 'Železo', copper: 'Měď', gold: 'Zlato', diamond: 'Diamant' };
  const oreEmojis = { iron: '⚙️', copper: '🟠', gold: '🟡', diamond: '💎' };
  const equipmentNames = { 
    weapon: '⚔️ Zbraň', 
    helmet: '⛑️ Helma', 
    armor: '🛡️ Brnění', 
    boots: '👟 Boty' 
  };

  const { SHOP_ITEMS } = await import('./shop.js');

  const auctionList = Array.from(activeAuctions.entries())
    .map(([id, auction]) => {
      if (auction.type === 'ore') {
        return `**${auction.sellerName}** - ${auction.amount}x ${oreEmojis[auction.oreType]} ${oreNames[auction.oreType]} (${auction.totalPrice} Kč)`;
      } else if (auction.type === 'equipment') {
        const item = SHOP_ITEMS[auction.equipmentId];
        return `**${auction.sellerName}** - ${equipmentNames[auction.equipmentType]}: ${item.name} [${auction.durability}%] (${auction.totalPrice} Kč)`;
      }
    })
    .join('\n');

  const embed = new EmbedBuilder()
    .setColor(0x3498DB)
    .setTitle('🏛️ Aktivní aukce')
    .setDescription(auctionList)
    .setFooter({ text: 'Použij tlačítko "Koupit" u konkrétní aukce' })
    .setTimestamp();

  await interaction.reply({ embeds: [embed], ephemeral: true });
}

// Export pro button handler
export async function handleAuctionButton(interaction, db) {
  const auctionId = interaction.customId.replace('auction_buy_', '');
  const buyerId = interaction.user.id;

  const auction = activeAuctions.get(auctionId);

  if (!auction) {
    return interaction.reply({
      content: '❌ Tato aukce už neexistuje!',
      ephemeral: true
    });
  }

  if (buyerId === auction.sellerId) {
    return interaction.reply({
      content: '❌ Nemůžeš koupit vlastní aukci!',
      ephemeral: true
    });
  }

  try {
    const buyerResult = await db.query('SELECT * FROM users WHERE id = $1', [buyerId]);
    const buyer = buyerResult.rows[0];

    if (!buyer) {
      return interaction.reply({
        content: 'Ještě nemáš postavu!',
        ephemeral: true
      });
    }

    if (buyer.money < auction.totalPrice) {
      return interaction.reply({
        content: `❌ Nemáš dost peněz! Potřebuješ **${auction.totalPrice} Kč**.`,
        ephemeral: true
      });
    }

    if (auction.type === 'ore') {
      // Transakce pro kovy
      await db.query(
        'UPDATE users SET money = money - $1, ' + auction.oreType + ' = ' + auction.oreType + ' + $2 WHERE id = $3',
        [auction.totalPrice, auction.amount, buyerId]
      );

      await db.query(
        'UPDATE users SET money = money + $1 WHERE id = $2',
        [auction.totalPrice, auction.sellerId]
      );

      // Odebrání aukce
      activeAuctions.delete(auctionId);

      const oreNames = { iron: 'Železo', copper: 'Měď', gold: 'Zlato', diamond: 'Diamant' };
      const oreEmojis = { iron: '⚙️', copper: '🟠', gold: '🟡', diamond: '💎' };

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Aukce dokončena!')
            .setDescription(`**${buyer.name || interaction.user.username}** koupil ${auction.amount}x ${oreEmojis[auction.oreType]} ${oreNames[auction.oreType]} od **${auction.sellerName}**!`)
            .addFields(
              { name: '💰 Cena', value: `${auction.totalPrice} Kč`, inline: true }
            )
            .setTimestamp()
        ],
        components: []
      });

    } else if (auction.type === 'equipment') {
      // Kontrola zda kupující už nemá toto vybavení
      if (buyer[auction.equipmentType]) {
        return interaction.reply({
          content: `❌ Už máš ${auction.equipmentType}! Musíš ho nejdřív prodat nebo vyhodit.`,
          ephemeral: true
        });
      }

      const durabilityColumn = `${auction.equipmentType}_durability`;

      // Transakce pro vybavení
      await db.query(
        `UPDATE users SET money = money - $1, ${auction.equipmentType} = $2, ${durabilityColumn} = $3 WHERE id = $4`,
        [auction.totalPrice, auction.equipmentId, auction.durability, buyerId]
      );

      await db.query(
        'UPDATE users SET money = money + $1 WHERE id = $2',
        [auction.totalPrice, auction.sellerId]
      );

      // Odebrání aukce
      activeAuctions.delete(auctionId);

      const { SHOP_ITEMS } = await import('./shop.js');
      const equipmentItem = SHOP_ITEMS[auction.equipmentId];
      const equipmentNames = { 
        weapon: '⚔️ Zbraň', 
        helmet: '⛑️ Helma', 
        armor: '🛡️ Brnění', 
        boots: '👟 Boty' 
      };

      await interaction.update({
        embeds: [
          new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Aukce dokončena!')
            .setDescription(`**${buyer.name || interaction.user.username}** koupil ${equipmentNames[auction.equipmentType]}: ${equipmentItem.name} od **${auction.sellerName}**!`)
            .addFields(
              { name: '💰 Cena', value: `${auction.totalPrice} Kč`, inline: true },
              { name: '🔧 Stav', value: `${auction.durability}%`, inline: true }
            )
            .setTimestamp()
        ],
        components: []
      });
    }
  } catch (error) {
    console.error('Auction button error:', error);
    throw error;
  }
}
