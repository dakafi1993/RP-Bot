import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Vsaď peníze v kasinu (roulette)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Kolik chceš vsadit?')
        .setRequired(true)
        .setMinValue(50)
    )
    .addStringOption(option =>
      option.setName('type')
        .setDescription('Typ sázky')
        .setRequired(true)
        .addChoices(
          { name: '🔴 Červená (2x)', value: 'red' },
          { name: '⚫ Černá (2x)', value: 'black' },
          { name: '🟢 Zelená/0 (36x)', value: 'green' }
        )
    )
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Sázka na konkrétní číslo 0-36 (36x)')
        .setRequired(false)
        .setMinValue(0)
        .setMaxValue(36)
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('amount');
    const betType = interaction.options.getString('type');
    const betNumber = interaction.options.getInteger('number');

    try {
      const result1 = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result1.rows[0];

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

      // Kontrola duplicitní sázky
      if (betType === 'green' && betNumber !== null && betNumber !== 0) {
        return interaction.reply({
          content: '❌ Nemůžeš sázet na zelenou a zároveň na jiné číslo!',
          ephemeral: true
        });
      }

      // Animace točení rulety
      const spinning = new EmbedBuilder()
        .setColor(0xFFD700)
        .setTitle('🎰 Ruleta')
        .setDescription('```\n🎲 Točím ruletou...\n```')
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [spinning], fetchReply: true, ephemeral: false });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Definice rulety (Evropská ruleta)
      const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
      const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
      
      // Náhodné číslo (0-36)
      const spinResult = Math.floor(Math.random() * 37);
      
      let resultColor;
      let colorEmoji;
      if (spinResult === 0) {
        resultColor = 'green';
        colorEmoji = '🟢';
      } else if (redNumbers.includes(spinResult)) {
        resultColor = 'red';
        colorEmoji = '🔴';
      } else {
        resultColor = 'black';
        colorEmoji = '⚫';
      }

      // Kontrola výhry
      let won = false;
      let multiplier = 0;

      // Sázka na barvu
      if (betType === resultColor) {
        won = true;
        multiplier = betType === 'green' ? 36 : 2;
      }

      // Sázka na konkrétní číslo
      if (betNumber !== null && betNumber === spinResult) {
        won = true;
        multiplier = 36;
      }

      let newMoney = user.money;
      let embedColor;
      let resultText;

      if (won) {
        const winAmount = bet * multiplier;
        const profit = winAmount - bet;
        newMoney += profit;
        await db.query('UPDATE users SET money = $1, wins = wins + 1 WHERE id = $2', [newMoney, userId]);
        
        embedColor = 0x2ECC71;
        resultText = `🎉 **VÝHRA!**\n${colorEmoji} Padlo číslo **${spinResult}**\n💰 Vyhrál jsi **${winAmount} Kč** (${multiplier}x)!`;
      } else {
        newMoney -= bet;
        await db.query('UPDATE users SET money = $1, losses = losses + 1 WHERE id = $2', [newMoney, userId]);
        
        embedColor = 0xE74C3C;
        resultText = `❌ **Prohra!**\n${colorEmoji} Padlo číslo **${spinResult}**\nProhral jsi **${bet} Kč**`;
      }

      const embed = new EmbedBuilder()
        .setColor(embedColor)
        .setTitle('🎰 Ruleta')
        .setDescription(resultText)
        .addFields(
          { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
        )
        .setTimestamp();

      await msg.edit({ embeds: [embed] });
    } catch (error) {
      console.error('Gamble command error:', error);
      throw error;
    }
  }
};
