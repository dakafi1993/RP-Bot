import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('slots')
    .setDescription('Zahraj si na automatech')
    .addIntegerOption(option =>
      option.setName('bet')
        .setDescription('Kolik chceš vsadit?')
        .setRequired(true)
        .setMinValue(50)
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

      const symbols = ['🍒', '🍋', '🍊', '🍇', '💎', '7️⃣'];
      
      const reel1 = symbols[Math.floor(Math.random() * symbols.length)];
      const reel2 = symbols[Math.floor(Math.random() * symbols.length)];
      const reel3 = symbols[Math.floor(Math.random() * symbols.length)];

      let multiplier = 0;
      let resultText = '';

      // Kontrola výhry
      if (reel1 === reel2 && reel2 === reel3) {
        // Všechny 3 stejné
        if (reel1 === '💎') {
          multiplier = 50;
          resultText = '💎💎💎 **MEGA JACKPOT!!!**';
        } else if (reel1 === '7️⃣') {
          multiplier = 20;
          resultText = '7️⃣7️⃣7️⃣ **JACKPOT!!!**';
        } else {
          multiplier = 10;
          resultText = '🎉 **Tři stejné!**';
        }
      } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
        // Dva stejné
        multiplier = 2;
        resultText = '✨ **Dva stejné!**';
      } else {
        // Prohra
        resultText = '❌ **Prohra**';
      }

      let newMoney = user.money;

      if (multiplier > 0) {
        const winAmount = bet * multiplier;
        newMoney += winAmount - bet;
        db.prepare('UPDATE users SET money = ?, wins = wins + 1 WHERE id = ?')
          .run(newMoney, userId);

        const embed = new EmbedBuilder()
          .setColor(0xFFD700)
          .setTitle('🎰 Slot Machine')
          .setDescription(`\`\`\`\n${reel1} ${reel2} ${reel3}\n\`\`\`\n${resultText}`)
          .addFields(
            { name: '💰 Výhra', value: `${winAmount} Kč (${multiplier}x)`, inline: true },
            { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: false });
      } else {
        newMoney -= bet;
        db.prepare('UPDATE users SET money = ?, losses = losses + 1 WHERE id = ?')
          .run(newMoney, userId);

        const embed = new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('🎰 Slot Machine')
          .setDescription(`\`\`\`\n${reel1} ${reel2} ${reel3}\n\`\`\`\n${resultText}`)
          .addFields(
            { name: '💸 Ztráta', value: `-${bet} Kč`, inline: true },
            { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
          )
          .setTimestamp();

        return interaction.reply({ embeds: [embed], ephemeral: false });
      }
    } catch (error) {
      console.error('Slots command error:', error);
      throw error;
    }
  }
};
