import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

const games = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('crash')
    .setDescription('Crash game - Vyber si správný čas k vycashování!')
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

      if (games.has(userId)) {
        return interaction.reply({
          content: '❌ Už máš rozehranou hru!',
          ephemeral: true
        });
      }

      // Určení crash pointu (kdy hra spadne)
      const crashPoint = (Math.random() * 9 + 1).toFixed(2); // 1.00 - 10.00x

      const game = {
        userId,
        bet,
        crashPoint: parseFloat(crashPoint),
        multiplier: 1.00,
        crashed: false,
        db
      };

      games.set(userId, game);

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('🚀 Crash Game')
        .setDescription('```\n📈 1.00x\n```\n🎯 Stiskni **Cash Out** včas!')
        .addFields(
          { name: '💰 Sázka', value: `${bet} Kč`, inline: true },
          { name: '💵 Možná výhra', value: `${bet} Kč`, inline: true }
        )
        .setTimestamp();

      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('crash_cashout')
            .setLabel('💰 Cash Out')
            .setStyle(ButtonStyle.Success)
        );

      await interaction.reply({ embeds: [embed], components: [row], ephemeral: false });

      // Spuštění hry
      runCrashGame(interaction, game);

    } catch (error) {
      console.error('Crash command error:', error);
      throw error;
    }
  }
};

async function runCrashGame(interaction, game) {
  const interval = setInterval(async () => {
    if (game.crashed) {
      clearInterval(interval);
      return;
    }

    game.multiplier += 0.10;

    if (game.multiplier >= game.crashPoint) {
      game.crashed = true;
      clearInterval(interval);

      const embed = new EmbedBuilder()
        .setColor(0xE74C3C)
        .setTitle('🚀 Crash Game - CRASHED!')
        .setDescription(`\`\`\`\n💥 ${game.crashPoint.toFixed(2)}x\n\`\`\`\n❌ Hra spadla!`)
        .addFields(
          { name: '💸 Ztráta', value: `${game.bet} Kč`, inline: true }
        )
        .setTimestamp();

      const user = game.db.prepare('SELECT * FROM users WHERE id = ?').get(game.userId);
      const newMoney = user.money - game.bet;
      game.db.prepare('UPDATE users SET money = ?, losses = losses + 1 WHERE id = ?')
        .run(newMoney, game.userId);

      await interaction.editReply({ embeds: [embed], components: [] });
      games.delete(game.userId);
      return;
    }

    const potentialWin = Math.floor(game.bet * game.multiplier);

    const embed = new EmbedBuilder()
      .setColor(game.multiplier > 2 ? 0x2ECC71 : 0x3498DB)
      .setTitle('🚀 Crash Game')
      .setDescription(`\`\`\`\n📈 ${game.multiplier.toFixed(2)}x\n\`\`\`\n🎯 Stiskni **Cash Out** včas!`)
      .addFields(
        { name: '💰 Sázka', value: `${game.bet} Kč`, inline: true },
        { name: '💵 Možná výhra', value: `${potentialWin} Kč`, inline: true }
      )
      .setTimestamp();

    try {
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      clearInterval(interval);
      games.delete(game.userId);
    }
  }, 800);
}

export async function handleCrashButton(interaction) {
  const userId = interaction.user.id;
  const game = games.get(userId);

  if (!game) {
    return interaction.reply({ content: '❌ Nemáš rozehranou hru!', ephemeral: true });
  }

  if (game.crashed) {
    return interaction.reply({ content: '❌ Hra už spadla!', ephemeral: true });
  }

  game.crashed = true;

  const winAmount = Math.floor(game.bet * game.multiplier);
  const profit = winAmount - game.bet;

  const user = game.db.prepare('SELECT * FROM users WHERE id = ?').get(game.userId);
  const newMoney = user.money + profit;
  game.db.prepare('UPDATE users SET money = ?, wins = wins + 1 WHERE id = ?')
    .run(newMoney, game.userId);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('🚀 Crash Game - CASHED OUT!')
    .setDescription(`\`\`\`\n✅ ${game.multiplier.toFixed(2)}x\n\`\`\`\n💰 Úspěšně vybraně!`)
    .addFields(
      { name: '💵 Výhra', value: `${winAmount} Kč`, inline: true },
      { name: '📈 Profit', value: `+${profit} Kč`, inline: true },
      { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
    )
    .setFooter({ text: `Hra by spadla na ${game.crashPoint.toFixed(2)}x` })
    .setTimestamp();

  await interaction.update({ embeds: [embed], components: [] });
  games.delete(game.userId);
}
