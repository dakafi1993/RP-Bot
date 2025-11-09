import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from 'discord.js';

const games = new Map();

export default {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Zahraj si Blackjack proti dealerovi')
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

      if (games.has(userId)) {
        return interaction.reply({
          content: '❌ Už máš rozehranou hru!',
          ephemeral: true
        });
      }

      // Vytvoření balíčku
      const deck = createDeck();
      const playerHand = [drawCard(deck), drawCard(deck)];
      const dealerHand = [drawCard(deck), drawCard(deck)];

      const game = {
        userId,
        bet,
        deck,
        playerHand,
        dealerHand,
        db
      };

      games.set(userId, game);

      const embed = createGameEmbed(game, false);
      const row = new ActionRowBuilder()
        .addComponents(
          new ButtonBuilder()
            .setCustomId('bj_hit')
            .setLabel('Hit 🃏')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('bj_stand')
            .setLabel('Stand ✋')
            .setStyle(ButtonStyle.Success)
        );

      await interaction.reply({ embeds: [embed], components: [row] });

      // Auto-bust check
      if (calculateHand(playerHand) > 21) {
        endGame(interaction, game, 'bust');
      }

    } catch (error) {
      console.error('Blackjack command error:', error);
      throw error;
    }
  }
};

// Button handler
export async function handleBlackjackButton(interaction) {
  const userId = interaction.user.id;
  const game = games.get(userId);

  if (!game) {
    return interaction.reply({ content: '❌ Nemáš rozehranou hru!', ephemeral: true });
  }

  if (interaction.customId === 'bj_hit') {
    game.playerHand.push(drawCard(game.deck));
    
    const playerScore = calculateHand(game.playerHand);
    
    if (playerScore > 21) {
      await endGame(interaction, game, 'bust');
    } else if (playerScore === 21) {
      await endGame(interaction, game, 'stand');
    } else {
      const embed = createGameEmbed(game, false);
      await interaction.update({ embeds: [embed] });
    }
  } else if (interaction.customId === 'bj_stand') {
    await endGame(interaction, game, 'stand');
  }
}

function createDeck() {
  const suits = ['♠️', '♥️', '♣️', '♦️'];
  const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck = [];
  
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  
  return shuffle(deck);
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function drawCard(deck) {
  return deck.pop();
}

function calculateHand(hand) {
  let sum = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      sum += 11;
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      sum += 10;
    } else {
      sum += parseInt(card.value);
    }
  }

  while (sum > 21 && aces > 0) {
    sum -= 10;
    aces--;
  }

  return sum;
}

function handToString(hand) {
  return hand.map(c => `${c.value}${c.suit}`).join(' ');
}

function createGameEmbed(game, showDealer) {
  const playerScore = calculateHand(game.playerHand);
  const dealerScore = calculateHand(game.dealerHand);

  const embed = new EmbedBuilder()
    .setColor(0x2ECC71)
    .setTitle('🃏 Blackjack')
    .addFields(
      { 
        name: '🎰 Dealer', 
        value: showDealer 
          ? `${handToString(game.dealerHand)} (${dealerScore})`
          : `${game.dealerHand[0].value}${game.dealerHand[0].suit} ❓`, 
        inline: false 
      },
      { 
        name: '👤 Tvé karty', 
        value: `${handToString(game.playerHand)} **(${playerScore})**`, 
        inline: false 
      }
    )
    .setFooter({ text: `Sázka: ${game.bet} Kč` });

  return embed;
}

async function endGame(interaction, game, action) {
  // Dealer plays
  while (calculateHand(game.dealerHand) < 17) {
    game.dealerHand.push(drawCard(game.deck));
  }

  const playerScore = calculateHand(game.playerHand);
  const dealerScore = calculateHand(game.dealerHand);

  let result;
  let won = false;

  if (action === 'bust') {
    result = '❌ **BUST!** Prohral jsi!';
    won = false;
  } else if (dealerScore > 21) {
    result = '✅ **Dealer BUST!** Vyhrál jsi!';
    won = true;
  } else if (playerScore > dealerScore) {
    result = '✅ **VÝHRA!** Máš vyšší skóre!';
    won = true;
  } else if (playerScore < dealerScore) {
    result = '❌ **PROHRA!** Dealer má vyšší skóre.';
    won = false;
  } else {
    result = '🤝 **REMÍZA!** Stejné skóre.';
    won = null;
  }

  // Update database
  const user = game.db.prepare('SELECT * FROM users WHERE id = ?').get(game.userId);
  let newMoney = user.money;

  if (won === true) {
    newMoney += game.bet;
    game.db.prepare('UPDATE users SET money = ?, wins = wins + 1 WHERE id = ?')
      .run(newMoney, game.userId);
  } else if (won === false) {
    newMoney -= game.bet;
    game.db.prepare('UPDATE users SET money = ?, losses = losses + 1 WHERE id = ?')
      .run(newMoney, game.userId);
  }

  const embed = createGameEmbed(game, true);
  embed.addFields({ name: 'Výsledek', value: `${result}\nZůstatek: **${newMoney} Kč**`, inline: false });

  await interaction.update({ embeds: [embed], components: [] });
  games.delete(game.userId);
}
