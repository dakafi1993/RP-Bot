import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Aktivní aukce
const activeAuctions = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('auction')
    .setDescription('Aukce kovů mezi hráči')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Vytvoř aukci')
        .addStringOption(option =>
          option.setName('ore')
            .setDescription('Který kov chceš prodat?')
            .setRequired(true)
            .addChoices(
              { name: '⚙️ Železo', value: 'iron' },
              { name: '🟠 Měď', value: 'copper' },
              { name: '🟡 Zlato', value: 'gold' },
              { name: '💎 Diamant', value: 'diamond' }
            )
        )
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Kolik kusů?')
            .setRequired(true)
            .setMinValue(1)
        )
        .addIntegerOption(option =>
          option.setName('price')
            .setDescription('Cena za kus')
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
  const oreType = interaction.options.getString('ore');
  const amount = interaction.options.getInteger('amount');
  const pricePerOre = interaction.options.getInteger('price');

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (!user) {
      return interaction.reply({ 
        content: 'Ještě nemáš postavu!', 
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
    const totalPrice = pricePerOre * amount;

    activeAuctions.set(auctionId, {
      sellerId: userId,
      sellerName: user.name,
      oreType,
      amount,
      pricePerOre,
      totalPrice
    });

    const embed = new EmbedBuilder()
      .setColor(0xFFD700)
      .setTitle('🏛️ Nová aukce!')
      .setDescription(`**${user.name}** nabízí:`)
      .addFields(
        { name: '📦 Produkt', value: `${amount}x ${oreEmojis[oreType]} ${oreNames[oreType]}`, inline: true },
        { name: '💰 Cena/ks', value: `${pricePerOre} Kč`, inline: true },
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

  const auctionList = Array.from(activeAuctions.entries())
    .map(([id, auction]) => {
      return `**${auction.sellerName}** - ${auction.amount}x ${oreEmojis[auction.oreType]} ${oreNames[auction.oreType]} (${auction.totalPrice} Kč)`;
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

    // Transakce
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
  } catch (error) {
    console.error('Auction button error:', error);
    throw error;
  }
}
