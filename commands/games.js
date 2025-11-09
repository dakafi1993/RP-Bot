import { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, StringSelectMenuBuilder } from 'discord.js';

// Minihry podle říší
const REALM_GAMES = {
  ancient: {
    name: '🏛️ Starodávná říše',
    games: [
      { id: 'dice', name: '🎲 Hoď kostkami', description: 'Klasická hra s kostkami' },
      { id: 'coinflip', name: '🪙 Hoď mincí', description: 'Hlava nebo orel' }
    ]
  },
  medieval: {
    name: '🏰 Středověká říše',
    games: [
      { id: 'dice', name: '🎲 Hoď kostkami', description: 'Klasická hra s kostkami' },
      { id: 'coinflip', name: '🪙 Hoď mincí', description: 'Hlava nebo orel' },
      { id: 'slots', name: '🎰 Slots', description: 'Slot machine' },
      { id: 'blackjack', name: '🃏 Blackjack', description: 'Karetní hra' }
    ]
  },
  renaissance: {
    name: '🎨 Renesanční říše',
    games: [
      { id: 'dice', name: '🎲 Hoď kostkami', description: 'Klasická hra s kostkami' },
      { id: 'coinflip', name: '🪙 Hoď mincí', description: 'Hlava nebo orel' },
      { id: 'slots', name: '🎰 Slots', description: 'Slot machine' },
      { id: 'blackjack', name: '🃏 Blackjack', description: 'Karetní hra' },
      { id: 'gamble', name: '🎡 Ruleta', description: 'Casino ruleta' }
    ]
  },
  modern: {
    name: '🏙️ Moderní říše',
    games: [
      { id: 'dice', name: '🎲 Hoď kostkami', description: 'Klasická hra s kostkami' },
      { id: 'coinflip', name: '🪙 Hoď mincí', description: 'Hlava nebo orel' },
      { id: 'slots', name: '🎰 Slots', description: 'Slot machine' },
      { id: 'blackjack', name: '🃏 Blackjack', description: 'Karetní hra' },
      { id: 'gamble', name: '🎡 Ruleta', description: 'Casino ruleta' },
      { id: 'crash', name: '📈 Crash', description: 'Multiplier crash game' }
    ]
  },
  futuristic: {
    name: '🚀 Futuristická říše',
    games: [
      { id: 'dice', name: '🎲 Hoď kostkami', description: 'Klasická hra s kostkami' },
      { id: 'coinflip', name: '🪙 Hoď mincí', description: 'Hlava nebo orel' },
      { id: 'slots', name: '🎰 Slots', description: 'Slot machine' },
      { id: 'blackjack', name: '🃏 Blackjack', description: 'Karetní hra' },
      { id: 'gamble', name: '🎡 Ruleta', description: 'Casino ruleta' },
      { id: 'crash', name: '📈 Crash', description: 'Multiplier crash game' },
      { id: 'quantum', name: '⚛️ Quantum Bet', description: 'Kvantová sázka (50% šance na 3x!)' }
    ]
  }
};

export default {
  data: new SlashCommandBuilder()
    .setName('games')
    .setDescription('Zobraz dostupné minihry pro tvou říši'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      const result = await db.query('SELECT realm, level FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: true 
        });
      }

      const realm = user.realm || 'ancient';
      const realmData = REALM_GAMES[realm];

      const embed = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle(`${realmData.name} - Dostupné hry`)
        .setDescription(
          `**Level:** ${user.level}\n` +
          `**Říše:** ${realmData.name}\n\n` +
          `Vyber si hru ze seznamu:`
        )
        .setTimestamp();

      // Přidání her do embedu
      realmData.games.forEach(game => {
        embed.addFields({
          name: game.name,
          value: game.description,
          inline: true
        });
      });

      embed.setFooter({ text: 'Postupuj do vyšších říší pro více her! (Level up)' });

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      console.error('Games command error:', error);
      throw error;
    }
  }
};
