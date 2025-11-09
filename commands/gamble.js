import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('gamble')
    .setDescription('Vsaď peníze v kasinu (roulette)')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('Kolik chceš vsadit?')
        .setRequired(true)
        .setMinValue(50)
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const bet = interaction.options.getInteger('amount');

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

      const roll = Math.random();
      let newMoney = user.money;
      let result;

      if (roll < 0.45) {
        // Prohra
        newMoney -= bet;
        await db.query('UPDATE users SET money = $1, losses = losses + 1 WHERE id = $2', [newMoney, userId]);
        result = `🎰 **Prohra!**\n❌ Prohral jsi **${bet} Kč**.\nZůstatek: **${newMoney} Kč**`;
      } else if (roll < 0.90) {
        // Výhra 2x
        const win = bet * 2;
        newMoney += bet;
        await db.query('UPDATE users SET money = $1, wins = wins + 1 WHERE id = $2', [newMoney, userId]);
        result = `🎰 **VÝHRA!**\n💰 Vyhrál jsi **${win} Kč**!\nZůstatek: **${newMoney} Kč**`;
      } else {
        // Jackpot 5x
        const win = bet * 5;
        newMoney += bet * 4;
        await db.query('UPDATE users SET money = $1, wins = wins + 1 WHERE id = $2', [newMoney, userId]);
        result = `🎰 **JACKPOT!!!**\n🎉💎 Vyhrál jsi **${win} Kč**!!!\nZůstatek: **${newMoney} Kč**`;
      }

      await interaction.reply({ content: result, ephemeral: false });
    } catch (error) {
      console.error('Gamble command error:', error);
      throw error;
    }
  }
};
