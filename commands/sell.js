import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

// Ceny kovů v shopu
const ORE_PRICES = {
  iron: 50,
  copper: 100,
  gold: 500,
  diamond: 2000
};

export default {
  data: new SlashCommandBuilder()
    .setName('sell')
    .setDescription('Prodej kovy do shopu')
    .addStringOption(option =>
      option.setName('ore')
        .setDescription('Který kov chceš prodat?')
        .setRequired(true)
        .addChoices(
          { name: '⚙️ Železo (50 Kč/ks)', value: 'iron' },
          { name: '🟠 Měď (100 Kč/ks)', value: 'copper' },
          { name: '🟡 Zlato (500 Kč/ks)', value: 'gold' },
          { name: '💎 Diamant (2000 Kč/ks)', value: 'diamond' }
        )
    )
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Kolik kusů?')
        .setRequired(true)
        .setMinValue(1)
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const oreType = interaction.options.getString('ore');
    const amount = interaction.options.getInteger('amount');

    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Kontrola zda má dostatek kovů
      if (user[oreType] < amount) {
        return interaction.reply({
          content: `❌ Nemáš dostatek kovů! Máš jen **${user[oreType]}x**.`,
          ephemeral: true
        });
      }

      // Výpočet výdělku
      const pricePerOre = ORE_PRICES[oreType];
      const totalPrice = pricePerOre * amount;

      // Aktualizace databáze
      const newMoney = user.money + totalPrice;
      const newOreAmount = user[oreType] - amount;

      await db.query(
        `UPDATE users SET money = $1, ${oreType} = $2 WHERE id = $3`,
        [newMoney, newOreAmount, userId]
      );

      const oreNames = {
        iron: 'Železo',
        copper: 'Měď',
        gold: 'Zlato',
        diamond: 'Diamant'
      };

      const oreEmojis = {
        iron: '⚙️',
        copper: '🟠',
        gold: '🟡',
        diamond: '💎'
      };

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('🏪 Prodej dokončen')
        .setDescription(`Prodal jsi **${amount}x ${oreEmojis[oreType]} ${oreNames[oreType]}**`)
        .addFields(
          { name: '💰 Výdělek', value: `${totalPrice} Kč`, inline: true },
          { name: '💳 Nový zůstatek', value: `${newMoney} Kč`, inline: true },
          { name: '📦 Zbývá', value: `${newOreAmount}x ${oreEmojis[oreType]}`, inline: true }
        )
        .setTimestamp();

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Sell command error:', error);
      throw error;
    }
  }
};
