import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Zkus spáchat zločin - vysoké riziko, vysoká odměna'),
  
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

      // Animace zločinu
      const planning = new EmbedBuilder()
        .setColor(0xE67E22)
        .setTitle('🎭 Kriminální akce')
        .setDescription('```\n🔍 Plánuješ zločin...\n```')
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [planning], fetchReply: true, ephemeral: false });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const crimes = [
        { name: 'Vykradl jsi bankomat', success: 0.5, reward: [300, 800], emoji: '🏧' },
        { name: 'Ukradl jsi auto', success: 0.6, reward: [500, 1200], emoji: '🚗' },
        { name: 'Vykradl jsi obchod', success: 0.7, reward: [200, 500], emoji: '🏪' },
        { name: 'Prodal jsi padělané hodinky', success: 0.8, reward: [100, 300], emoji: '⌚' },
        { name: 'Vykradl jsi dům', success: 0.4, reward: [800, 2000], emoji: '🏠' }
      ];

      const crime = crimes[Math.floor(Math.random() * crimes.length)];
      let successChance = crime.success;
      
      // Warrior rasový bonus (+30% úspěšnost)
      if (user.race === 'warrior') {
        successChance = Math.min(1, successChance + 0.3);
      }
      
      const success = Math.random() < successChance;

      if (success) {
        const earned = Math.floor(Math.random() * (crime.reward[1] - crime.reward[0])) + crime.reward[0];
        let xpEarned = Math.floor(earned / 20);
        
        // Mage rasový bonus (+50% XP)
        if (user.race === 'mage') {
          xpEarned = Math.floor(xpEarned * 1.5);
        }

        let newXp = user.xp + xpEarned;
        let newMoney = user.money + earned;
        let newLevel = user.level;
        let leveledUp = false;

        if (newXp >= 100) {
          newLevel++;
          newXp = 0;
          leveledUp = true;
        }

        await db.query(
          'UPDATE users SET money = $1, xp = $2, level = $3 WHERE id = $4',
          [newMoney, newXp, newLevel, userId]
        );

        const embed = new EmbedBuilder()
          .setColor(0x2ECC71)
          .setTitle(`${crime.emoji} Úspěch!`)
          .setDescription(`**${crime.name}!**`)
          .addFields(
            { name: '💰 Zisk', value: `${earned} Kč`, inline: true },
            { name: '⭐ XP', value: `+${xpEarned} XP`, inline: true },
            { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
          )
          .setTimestamp();
        
        if (leveledUp) {
          embed.addFields({ name: '🎉 LEVEL UP!', value: `Nyní jsi level **${newLevel}**!`, inline: false });
        }

        await msg.edit({ embeds: [embed] });
      } else {
        const fine = Math.floor(user.money * 0.3);
        const newMoney = Math.max(0, user.money - fine);

        await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, userId]);

        const embed = new EmbedBuilder()
          .setColor(0xE74C3C)
          .setTitle('🚨 Chycen!')
          .setDescription(`**Pokus o: ${crime.name}**\n\nChytila tě policie!`)
          .addFields(
            { name: '💸 Pokuta', value: `${fine} Kč`, inline: true },
            { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
          )
          .setTimestamp();

        await msg.edit({ embeds: [embed] });
      }
    } catch (error) {
      console.error('Crime command error:', error);
      throw error;
    }
  }
};
