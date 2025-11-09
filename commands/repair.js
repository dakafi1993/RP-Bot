import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

// Ceny oprav podle typu krumpáče
const REPAIR_COSTS = {
  iron: 2000,      // Železný - 2000 Kč
  diamond: 10000   // Diamantový - 10000 Kč
};

export default {
  data: new SlashCommandBuilder()
    .setName('repair')
    .setDescription('Oprav svůj krumpáč'),
  
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

      const pickaxe = user.pickaxe || 'wooden';
      const durability = user.pickaxe_durability || 100;

      // Dřevěný krumpáč se nedá opravit
      if (pickaxe === 'wooden') {
        return interaction.reply({
          content: '❌ Dřevěný krumpáč se nedá opravit! Kup si nový v `/shop`.',
          ephemeral: true
        });
      }

      // Kontrola zda je krumpáč rozbitý
      if (durability === 100) {
        return interaction.reply({
          content: '✅ Tvůj krumpáč je v perfektním stavu! Nepotřebuje opravu.',
          ephemeral: true
        });
      }

      const repairCost = REPAIR_COSTS[pickaxe];
      const pickaxeNames = {
        iron: '⚙️ Železný krumpáč',
        diamond: '💎 Diamantový krumpáč'
      };

      // Kontrola peněz
      if (user.money < repairCost) {
        return interaction.reply({
          content: `❌ Nemáš dost peněz! Oprava ${pickaxeNames[pickaxe]} stojí **${repairCost.toLocaleString()} Kč**.\nMáš pouze **${user.money.toLocaleString()} Kč**.`,
          ephemeral: true
        });
      }

      const embed = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle('🔧 Oprava krumpáče')
        .setDescription(
          `**Krumpáč:** ${pickaxeNames[pickaxe]}\n` +
          `**Durability:** ${durability}% → 100%\n` +
          `**Cena:** ${repairCost.toLocaleString()} Kč`
        )
        .setFooter({ text: 'Potvrď opravu tlačítkem' });

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('repair_confirm')
            .setLabel('✅ Opravit')
            .setStyle(ButtonStyle.Success),
          new ButtonBuilder()
            .setCustomId('repair_cancel')
            .setLabel('❌ Zrušit')
            .setStyle(ButtonStyle.Danger)
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });

    } catch (error) {
      console.error('Repair command error:', error);
      throw error;
    }
  }
};

// Handler pro tlačítka
export async function handleRepairButton(interaction, db) {
  const userId = interaction.user.id;

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    if (interaction.customId === 'repair_cancel') {
      const embed = new EmbedBuilder()
        .setColor(0x95A5A6)
        .setTitle('🔧 Oprava zrušena')
        .setDescription('Tvůj krumpáč zůstává neop revený.');

      await interaction.update({ embeds: [embed], components: [] });
      return;
    }

    if (interaction.customId === 'repair_confirm') {
      const pickaxe = user.pickaxe;
      const repairCost = REPAIR_COSTS[pickaxe];

      // Kontrola peněz znovu
      if (user.money < repairCost) {
        const embed = new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('❌ Oprava selhala')
          .setDescription(`Nemáš dost peněz! Potřebuješ **${repairCost.toLocaleString()} Kč**.`);

        await interaction.update({ embeds: [embed], components: [] });
        return;
      }

      // Oprava krumpáče
      await db.query(
        'UPDATE users SET pickaxe_durability = 100, money = money - $1 WHERE id = $2',
        [repairCost, userId]
      );

      const pickaxeNames = {
        iron: '⚙️ Železný krumpáč',
        diamond: '💎 Diamantový krumpáč'
      };

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('✅ Krumpáč opraven!')
        .setDescription(
          `**${pickaxeNames[pickaxe]}** byl úspěšně opraven!\n\n` +
          `💰 Zaplatil jsi: **${repairCost.toLocaleString()} Kč**\n` +
          `🔧 Durability: **100%**\n` +
          `💵 Zbývá ti: **${(user.money - repairCost).toLocaleString()} Kč**`
        )
        .setFooter({ text: 'Použij /mine pro další těžbu!' });

      await interaction.update({ embeds: [embed], components: [] });
    }

  } catch (error) {
    console.error('Repair button error:', error);
    await interaction.reply({ content: '❌ Chyba při opravě!', ephemeral: true });
  }
}
