import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('mine')
    .setDescription('Těž kovy v dolech'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);
      const user = result.rows[0];

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Pickaxe systém
      const pickaxes = {
        wooden: {
          name: '🪵 Dřevěný krumpáč',
          rates: { iron: 0.80, copper: 0.20, gold: 0, diamond: 0 }
        },
        iron: {
          name: '⚙️ Železný krumpáč',
          rates: { iron: 0.50, copper: 0.30, gold: 0.20, diamond: 0 }
        },
        diamond: {
          name: '💎 Diamantový krumpáč',
          rates: { iron: 0.30, copper: 0.30, gold: 0.30, diamond: 0.10 }
        }
      };

      const currentPickaxe = pickaxes[user.pickaxe || 'wooden'];

      // Animace těžby
      const mining = new EmbedBuilder()
        .setColor(0x95A5A6)
        .setTitle('⛏️ Těžba')
        .setDescription(`\`\`\`\n⛏️ Kopáš v dole s ${currentPickaxe.name}...\n\`\`\``)
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [mining], fetchReply: true, ephemeral: false });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // RNG podle krumpáče
      const roll = Math.random();
      let foundOre;
      let oreEmoji;
      let oreAmount;
      let oreType;

      const rates = currentPickaxe.rates;
      
      if (roll < rates.iron) {
        foundOre = 'Železo';
        oreEmoji = '⚙️';
        oreAmount = Math.floor(Math.random() * 3) + 2; // 2-4
        oreType = 'iron';
      } else if (roll < rates.iron + rates.copper) {
        foundOre = 'Měď';
        oreEmoji = '🟠';
        oreAmount = Math.floor(Math.random() * 2) + 1; // 1-2
        oreType = 'copper';
      } else if (roll < rates.iron + rates.copper + rates.gold) {
        foundOre = 'Zlato';
        oreEmoji = '🟡';
        oreAmount = 1;
        oreType = 'gold';
      } else {
        foundOre = 'Diamant';
        oreEmoji = '💎';
        oreAmount = 1;
        oreType = 'diamond';
      }

      // Aktualizace inventáře
      await db.query(
        `UPDATE users SET ${oreType} = ${oreType} + $1 WHERE id = $2`,
        [oreAmount, userId]
      );

      // Získání aktuálních hodnot
      const updatedResult = await db.query('SELECT iron, copper, gold, diamond FROM users WHERE id = $1', [userId]);
      const inventory = updatedResult.rows[0];

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('⛏️ Těžba')
        .setDescription(`${oreEmoji} **Našel jsi ${oreAmount}x ${foundOre}!**\n\n🛠️ **Krumpáč:** ${currentPickaxe.name}`)
        .addFields(
          { name: '📦 Tvůj inventář', value: 
            `⚙️ Železo: **${inventory.iron}**\n` +
            `🟠 Měď: **${inventory.copper}**\n` +
            `🟡 Zlato: **${inventory.gold}**\n` +
            `💎 Diamant: **${inventory.diamond}**`,
            inline: false 
          }
        )
        .setFooter({ text: 'Použij /upgrade pro lepší krumpáč | /sell pro prodej kovů' })
        .setTimestamp();

      await msg.edit({ embeds: [embed] });
    } catch (error) {
      console.error('Mine command error:', error);
      console.error('Error details:', error.message);
      console.error('Stack:', error.stack);
      
      const errorReply = { 
        content: `❌ Chyba při těžení: ${error.message}`, 
        ephemeral: true 
      };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errorReply);
      } else {
        await interaction.reply(errorReply);
      }
    }
  }
};
