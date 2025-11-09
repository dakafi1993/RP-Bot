import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { SHOP_ITEMS } from './shop.js';

export default {
  data: new SlashCommandBuilder()
    .setName('equip')
    .setDescription('Nasaď vybavení')
    .addStringOption(option =>
      option.setName('slot')
        .setDescription('Slot vybavení')
        .setRequired(true)
        .addChoices(
          { name: '⚔️ Zbraň', value: 'weapon' },
          { name: '⛑️ Helma', value: 'helmet' },
          { name: '🛡️ Brnění', value: 'armor' },
          { name: '👟 Boty', value: 'boots' },
          { name: '🧪 Lektvar', value: 'potion' }
        )
    )
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Klíč itemu (např. iron_sword)')
        .setRequired(true)
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const slot = interaction.options.getString('slot');
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

      // Kontrola zda item existuje
      const item = SHOP_ITEMS[itemKey];
      
      if (!item) {
        return interaction.reply({
          content: '❌ Tento item neexistuje!',
          ephemeral: true
        });
      }

      // Kontrola zda item patří do slotu
      if (item.category !== slot) {
        return interaction.reply({
          content: `❌ ${item.name} nelze nasadit do slotu ${slot}!`,
          ephemeral: true
        });
      }

      // Nasazení itemu
      await db.query(
        `UPDATE users SET ${slot} = $1 WHERE id = $2`,
        [itemKey, userId]
      );

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('✅ Vybavení nasazeno!')
        .setDescription(`Nasadil jsi **${item.name}** do slotu **${slot}**!`)
        .setFooter({ text: 'Použij /profile pro zobrazení postavy' });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Equip error:', error);
      throw error;
    }
  }
};
