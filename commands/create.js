const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create a new character')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Your character name')
        .setRequired(true)
    ),
  async execute(interaction, db) {
    const characterName = interaction.options.getString('name');
    const userId = interaction.user.id;

    const existing = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);

    if (existing) {
      return interaction.reply({ content: 'You already have a character!', ephemeral: true });
    }

    db.prepare('INSERT INTO users (user_id, character_name, money, xp, level) VALUES (?, ?, 0, 0, 1)')
      .run(userId, characterName);

    await interaction.reply(`Character **${characterName}** created successfully!`);
  }
};
