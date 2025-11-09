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

      // Animace těžby
      const mining = new EmbedBuilder()
        .setColor(0x95A5A6)
        .setTitle('⛏️ Těžba')
        .setDescription('```\n⛏️ Kopáš v dole...\n```')
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [mining], fetchReply: true, ephemeral: false });

      await new Promise(resolve => setTimeout(resolve, 2000));

      // Šance na různé kovy
      const roll = Math.random();
      let foundOre;
      let oreEmoji;
      let oreAmount;
      let oreType;

      if (roll < 0.50) {
        // 50% - Železo (běžné)
        foundOre = 'Železo';
        oreEmoji = '⚙️';
        oreAmount = Math.floor(Math.random() * 3) + 2; // 2-4
        oreType = 'iron';
      } else if (roll < 0.80) {
        // 30% - Měď (neběžné)
        foundOre = 'Měď';
        oreEmoji = '🟠';
        oreAmount = Math.floor(Math.random() * 2) + 1; // 1-2
        oreType = 'copper';
      } else if (roll < 0.95) {
        // 15% - Zlato (vzácné)
        foundOre = 'Zlato';
        oreEmoji = '🟡';
        oreAmount = 1;
        oreType = 'gold';
      } else {
        // 5% - Diamant (velmi vzácné)
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
        .setDescription(`${oreEmoji} **Našel jsi ${oreAmount}x ${foundOre}!**`)
        .addFields(
          { name: '📦 Tvůj inventář', value: 
            `⚙️ Železo: **${inventory.iron}**\n` +
            `🟠 Měď: **${inventory.copper}**\n` +
            `🟡 Zlato: **${inventory.gold}**\n` +
            `💎 Diamant: **${inventory.diamond}**`,
            inline: false 
          }
        )
        .setFooter({ text: 'Použij /sell pro prodej kovů' })
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
