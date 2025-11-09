import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('unequip')
    .setDescription('Sundej vybavení')
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
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const slot = interaction.options.getString('slot');

    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Kontrola zda má nasazené vybavení
      if (!user[slot]) {
        return interaction.reply({
          content: `❌ Nemáš nic nasazeno ve slotu **${slot}**!`,
          ephemeral: true
        });
      }

      // Sundání itemu
      await db.query(
        `UPDATE users SET ${slot} = NULL WHERE id = $1`,
        [userId]
      );

      const embed = new EmbedBuilder()
        .setColor(0x95A5A6)
        .setTitle('✅ Vybavení sundáno!')
        .setDescription(`Sundal jsi vybavení ze slotu **${slot}**!`)
        .setFooter({ text: 'Použij /profile pro zobrazení postavy' });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Unequip error:', error);
      throw error;
    }
  }
};
