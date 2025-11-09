import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('Hoď kostkami proti botovi')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Kolik chceš vsadit?')
        .setRequired(true)
        .setMinValue(100)
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('bet');

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

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

      // Animace hodu
      const rolling = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🎲 Dice Battle')
        .setDescription('```\n🎲 Házím kostkami...\n```')
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [rolling], fetchReply: true, ephemeral: false });

      await new Promise(resolve => setTimeout(resolve, 1500));

      // Hod kostkami
      const playerDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];
      const botDice = [
        Math.floor(Math.random() * 6) + 1,
        Math.floor(Math.random() * 6) + 1
      ];

      const playerTotal = playerDice.reduce((a, b) => a + b, 0);
      const botTotal = botDice.reduce((a, b) => a + b, 0);

      const diceEmojis = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      const playerDiceStr = playerDice.map(d => diceEmojis[d - 1]).join(' ');
      const botDiceStr = botDice.map(d => diceEmojis[d - 1]).join(' ');

      let result;
      let won = false;
      let color;

      if (playerTotal > botTotal) {
        result = '✅ **VÝHRA!**';
        won = true;
        color = 0x2ECC71;
      } else if (playerTotal < botTotal) {
        result = '❌ **PROHRA!**';
        won = false;
        color = 0xE74C3C;
      } else {
        result = '🤝 **REMÍZA!**';
        won = null;
        color = 0xFFD700;
      }

      let newMoney = user.money;

      if (won === true) {
        newMoney += bet;
        db.prepare('UPDATE users SET money = ?, wins = wins + 1 WHERE id = ?')
          .run(newMoney, userId);
      } else if (won === false) {
        newMoney -= bet;
        db.prepare('UPDATE users SET money = ?, losses = losses + 1 WHERE id = ?')
          .run(newMoney, userId);
      }

      const embed = new EmbedBuilder()
        .setColor(color)
        .setTitle('🎲 Dice Battle')
        .setDescription(result)
        .addFields(
          { name: '👤 Tvé kostky', value: `${playerDiceStr}\n**Celkem: ${playerTotal}**`, inline: true },
          { name: '🤖 Bot kostky', value: `${botDiceStr}\n**Celkem: ${botTotal}**`, inline: true }
        )
        .setTimestamp();

      if (won !== null) {
        embed.addFields(
          { name: won ? '💰 Výhra' : '💸 Ztráta', value: `${won ? '+' : '-'}${bet} Kč`, inline: true },
          { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
        );
      } else {
        embed.addFields({ name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: false });
      }

      await msg.edit({ embeds: [embed] });

    } catch (error) {
      console.error('Dice command error:', error);
      throw error;
    }
  }
};
