import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const games = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('coinflip')
    .setDescription('Hoď mincí - Hlava nebo orel?')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Kolik chceš vsadit?')
        .setRequired(true)
        .setMinValue(100)
    )
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Hlava nebo orel?')
        .setRequired(true)
        .addChoices(
          { name: '👑 Hlava', value: 'heads' },
          { name: '🦅 Orel', value: 'tails' }
        )
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');
    const choice = interaction.options.getString('choice');

    try {
      const userResult = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = userResult.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      if (user.money < bet) {
        return interaction.reply({
          content: `❌ Nemáš dost peněz! Máš jen **${user.money} Kč**.`,
          ephemeral: false
        });
      }

      const choiceEmoji = choice === 'heads' ? '👑' : '🦅';
      const choiceText = choice === 'heads' ? 'Hlava' : 'Orel';

      // Animace hodu mincí
      const flipping = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🪙 Coinflip')
        .setDescription('```\n🔄 Házím mincí...\n```')
        .addFields({ name: 'Tvá volba', value: `${choiceEmoji} ${choiceText}`, inline: true })
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [flipping], fetchReply: true, ephemeral: false });

      // Simulace točení
      await new Promise(resolve => setTimeout(resolve, 1500));

      const result = Math.random() < 0.5 ? 'heads' : 'tails';
      const won = result === choice;

      const resultEmoji = result === 'heads' ? '👑' : '🦅';
      const resultText = result === 'heads' ? 'Hlava' : 'Orel';

      let newMoney = user.money;

      if (won) {
        newMoney += bet;
        await db.query('UPDATE users SET money = $1, wins = wins + 1 WHERE id = $2', [newMoney, userId]);

        const embed = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle('🪙 Coinflip - VÝHRA!')
          .setDescription(`\`\`\`\n   ${resultEmoji}\n\`\`\`\nPadlo: **${resultText}**`)
          .addFields(
            { name: 'Tvá volba', value: `${choiceEmoji} ${choiceText}`, inline: true },
            { name: '💰 Výhra', value: `+${bet} Kč`, inline: true },
            { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
          )
          .setTimestamp();

        await msg.edit({ embeds: [embed] });
      } else {
        newMoney -= bet;
        await db.query('UPDATE users SET money = $1, losses = losses + 1 WHERE id = $2', [newMoney, userId]);

        const embed = new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('🪙 Coinflip - Prohra')
          .setDescription(`\`\`\`\n   ${resultEmoji}\n\`\`\`\nPadlo: **${resultText}**`)
          .addFields(
            { name: 'Tvá volba', value: `${choiceEmoji} ${choiceText}`, inline: true },
            { name: '💸 Ztráta', value: `-${bet} Kč`, inline: true },
            { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
          )
          .setTimestamp();

        await msg.edit({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Coinflip command error:', error);
      throw error;
    }
  }
};
