const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('profile')
    .setDescription('View your character profile'),
  async execute(interaction, db) {
    const userId = interaction.user.id;

    const user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

    if (!user) {
      return interaction.reply({ content: 'You don\'t have a character yet! Use `/create` to make one.', ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setColor(0x0099FF)
      .setTitle(`${user.character_name}'s Profile`)
      .addFields(
        { name: 'Level', value: user.level.toString(), inline: true },
        { name: 'XP', value: user.xp.toString(), inline: true },
        { name: 'Money', value: `$${user.money}`, inline: true }
      )
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
