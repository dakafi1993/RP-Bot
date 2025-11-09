import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const PICKAXE_UPGRADES = {
  wooden: {
    name: '🪵 Dřevěný krumpáč',
    next: 'iron',
    nextName: '⚙️ Železný krumpáč',
    cost: 5000,
    rates: '80% Železo, 20% Měď'
  },
  iron: {
    name: '⚙️ Železný krumpáč',
    next: 'diamond',
    nextName: '💎 Diamantový krumpáč',
    cost: 50000,
    rates: '50% Železo, 30% Měď, 20% Zlato'
  },
  diamond: {
    name: '💎 Diamantový krumpáč',
    next: null,
    rates: '30% Železo, 30% Měď, 30% Zlato, 10% Diamant'
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('upgrade')
    .setDescription('Vylepši svůj krumpáč pro lepší rudy'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: true 
        });
      }

      const currentPickaxe = user.pickaxe || 'wooden';
      const pickaxeInfo = PICKAXE_UPGRADES[currentPickaxe];

      // Maximální upgrade
      if (!pickaxeInfo.next) {
        return interaction.reply({
          embeds: [
            new EmbedBuilder()
              .setColor(0xFFD700)
              .setTitle('💎 Maximální upgrade!')
              .setDescription(`Už máš nejlepší krumpáč: **${pickaxeInfo.name}**`)
              .addFields(
                { name: '📊 Šance na rudy', value: pickaxeInfo.rates, inline: false }
              )
              .setTimestamp()
          ],
          ephemeral: true
        });
      }

      // Zobrazení možnosti upgradu
      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🛠️ Upgrade krumpáče')
        .setDescription(
          `**Aktuální:** ${pickaxeInfo.name}\n` +
          `📊 ${pickaxeInfo.rates}\n\n` +
          `**Dostupný upgrade:** ${pickaxeInfo.nextName}\n` +
          `📊 ${PICKAXE_UPGRADES[pickaxeInfo.next].rates}`
        )
        .addFields(
          { name: '💰 Cena upgradu', value: `${pickaxeInfo.cost.toLocaleString()} Kč`, inline: true },
          { name: '💵 Tvé peníze', value: `${user.money.toLocaleString()} Kč`, inline: true }
        )
        .setFooter({ text: 'Klikni na tlačítko pro zakoupení' })
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('upgrade_pickaxe')
            .setLabel(`Koupit za ${pickaxeInfo.cost.toLocaleString()} Kč`)
            .setStyle(ButtonStyle.Success)
            .setEmoji('⬆️')
            .setDisabled(user.money < pickaxeInfo.cost)
        );

      await interaction.reply({ embeds: [embed], components: [row] });
    } catch (error) {
      console.error('Upgrade command error:', error);
      await interaction.reply({
        content: '❌ Chyba při zobrazení upgradu.',
        ephemeral: true
      });
    }
  }
};

// Button handler
export async function handleUpgradeButton(interaction, db) {
  const userId = interaction.user.id;

  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = result.rows[0];

    const currentPickaxe = user.pickaxe || 'wooden';
    const pickaxeInfo = PICKAXE_UPGRADES[currentPickaxe];

    if (!pickaxeInfo.next) {
      return interaction.reply({
        content: '❌ Už máš nejlepší krumpáč!',
        ephemeral: true
      });
    }

    if (user.money < pickaxeInfo.cost) {
      return interaction.reply({
        content: `❌ Nemáš dost peněz! Potřebuješ ${pickaxeInfo.cost.toLocaleString()} Kč.`,
        ephemeral: true
      });
    }

    // Upgrade
    await db.query(
      'UPDATE users SET pickaxe = $1, money = money - $2 WHERE id = $3',
      [pickaxeInfo.next, pickaxeInfo.cost, userId]
    );

    const successEmbed = new EmbedBuilder()
      .setColor(0x2ECC71)
      .setTitle('✅ Upgrade dokončen!')
      .setDescription(
        `Upgradoval jsi na **${pickaxeInfo.nextName}**!\n\n` +
        `📊 **Nové šance:** ${PICKAXE_UPGRADES[pickaxeInfo.next].rates}`
      )
      .addFields(
        { name: '💸 Zaplaceno', value: `${pickaxeInfo.cost.toLocaleString()} Kč`, inline: true },
        { name: '💰 Zbývá', value: `${(user.money - pickaxeInfo.cost).toLocaleString()} Kč`, inline: true }
      )
      .setTimestamp();

    await interaction.update({ 
      embeds: [successEmbed], 
      components: [] 
    });
  } catch (error) {
    console.error('Upgrade button error:', error);
    await interaction.reply({
      content: '❌ Chyba při upgradu.',
      ephemeral: true
    });
  }
}
