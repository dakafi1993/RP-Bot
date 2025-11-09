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

      // Kontrola cooldownu (5 minut)
      const now = Date.now();
      const cooldownTime = 5 * 60 * 1000; // 5 minut
      const timeLeft = user.last_mine + cooldownTime - now;

      if (timeLeft > 0) {
        const minutesLeft = Math.ceil(timeLeft / (1000 * 60));
        const secondsLeft = Math.ceil((timeLeft % (1000 * 60)) / 1000);
        return interaction.reply({
          content: `⏰ Musíš počkat ještě **${minutesLeft}m ${secondsLeft}s** před další těžbou!`,
          ephemeral: true
        });
      }

      // Kontrola durability
      if (user.pickaxe_durability <= 0) {
        if (user.pickaxe === 'wooden') {
          return interaction.reply({
            content: '💔 Tvůj dřevěný krumpáč se rozbil! Kup si nový v `/shop`.',
            ephemeral: true
          });
        } else {
          return interaction.reply({
            content: `🔧 Tvůj krumpáč je rozbitý! Oprav ho pomocí \`/repair\`.`,
            ephemeral: true
          });
        }
      }

      // Pickaxe systém s šancí na diamant
      const pickaxes = {
        wooden: {
          name: '🪵 Dřevěný krumpáč',
          rates: { iron: 0.70, copper: 0.25, gold: 0, diamond: 0.05 } // 5% diamant
        },
        iron: {
          name: '⚙️ Železný krumpáč',
          rates: { iron: 0.45, copper: 0.30, gold: 0.15, diamond: 0.10 } // 10% diamant
        },
        diamond: {
          name: '💎 Diamantový krumpáč',
          rates: { iron: 0.25, copper: 0.25, gold: 0.30, diamond: 0.20 } // 20% diamant
        }
      };

      const currentPickaxe = pickaxes[user.pickaxe || 'wooden'];

      // Kontrola diamant cooldownu (10 minut)
      const diamondCooldown = 10 * 60 * 1000; // 10 minut
      const timeSinceDiamond = now - (user.last_diamond_mine || 0);
      const canMineDiamond = timeSinceDiamond >= diamondCooldown;

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
        // Diamant - kontrola 10min cooldownu
        if (canMineDiamond) {
          foundOre = 'Diamant';
          oreEmoji = '💎';
          oreAmount = 1;
          oreType = 'diamond';
        } else {
          // Pokud nemůže diamant, dá zlato místo toho
          foundOre = 'Zlato';
          oreEmoji = '🟡';
          oreAmount = 1;
          oreType = 'gold';
        }
      }

      // Aktualizace inventáře a durability
      const newDurability = user.pickaxe === 'wooden' ? 0 : Math.max(0, user.pickaxe_durability - 10);
      
      // Pokud je diamant, update last_diamond_mine
      if (oreType === 'diamond') {
        await db.query(
          `UPDATE users SET ${oreType} = ${oreType} + $1, last_mine = $2, last_diamond_mine = $2, pickaxe_durability = $3 WHERE id = $4`,
          [oreAmount, now, newDurability, userId]
        );
      } else {
        await db.query(
          `UPDATE users SET ${oreType} = ${oreType} + $1, last_mine = $2, pickaxe_durability = $3 WHERE id = $4`,
          [oreAmount, now, newDurability, userId]
        );
      }

      // Získání aktuálních hodnot
      const updatedResult = await db.query('SELECT iron, copper, gold, diamond FROM users WHERE id = $1', [userId]);
      const inventory = updatedResult.rows[0];

      // Varování pokud se krumpáč rozbit
      let durabilityWarning = '';
      if (user.pickaxe === 'wooden' && newDurability === 0) {
        durabilityWarning = '\n\n💔 **Tvůj dřevěný krumpáč se rozbil!** Kup si nový v `/shop`.';
      } else if (newDurability === 0) {
        durabilityWarning = '\n\n🔧 **Tvůj krumpáč je rozbitý!** Oprav ho pomocí `/repair`.';
      } else if (newDurability <= 20) {
        durabilityWarning = `\n\n⚠️ **Tvůj krumpáč je málem rozbitý!** Zbývá ${newDurability}% durability.`;
      }

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle('⛏️ Těžba')
        .setDescription(
          `${oreEmoji} **Našel jsi ${oreAmount}x ${foundOre}!**\n\n` +
          `🛠️ **Krumpáč:** ${currentPickaxe.name}\n` +
          `🔧 **Durability:** ${newDurability}%${durabilityWarning}`
        )
        .addFields(
          { name: '📦 Tvůj inventář', value: 
            `⚙️ Železo: **${inventory.iron}**\n` +
            `🟠 Měď: **${inventory.copper}**\n` +
            `🟡 Zlato: **${inventory.gold}**\n` +
            `💎 Diamant: **${inventory.diamond}**`,
            inline: false 
          }
        )
        .setFooter({ text: '⏰ Další těžba za 30 minut | /repair pro opravu | /upgrade pro lepší krumpáč' })
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
