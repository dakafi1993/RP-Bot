import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('crime')
    .setDescription('Zkus spáchat zločin - vysoké riziko, vysoká odměna'),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      const crimes = [
        { name: 'Vykradl jsi bankomat', success: 0.5, reward: [300, 800] },
        { name: 'Ukradl jsi auto', success: 0.6, reward: [500, 1200] },
        { name: 'Vykradl jsi obchod', success: 0.7, reward: [200, 500] },
        { name: 'Prodal jsi padělané hodinky', success: 0.8, reward: [100, 300] },
        { name: 'Vykradl jsi dům', success: 0.4, reward: [800, 2000] }
      ];

      const crime = crimes[Math.floor(Math.random() * crimes.length)];
      const success = Math.random() < crime.success;

      if (success) {
        const earned = Math.floor(Math.random() * (crime.reward[1] - crime.reward[0])) + crime.reward[0];
        const xpEarned = Math.floor(earned / 20);

        let newXp = user.xp + xpEarned;
        let newMoney = user.money + earned;
        let newLevel = user.level;
        let leveledUp = false;

        if (newXp >= 100) {
          newLevel++;
          newXp = 0;
          leveledUp = true;
        }

        db.prepare('UPDATE users SET money = ?, xp = ?, level = ? WHERE id = ?')
          .run(newMoney, newXp, newLevel, userId);

        let response = `🎭 **${crime.name}!**\n✅ Vydělal jsi **${earned} Kč** a **${xpEarned} XP**!`;
        
        if (leveledUp) {
          response += `\n\n🎉 **LEVEL UP!** Nyní jsi level **${newLevel}**!`;
        }

        return interaction.reply({ content: response, ephemeral: false });
      } else {
        const fine = Math.floor(user.money * 0.3);
        const newMoney = Math.max(0, user.money - fine);

        db.prepare('UPDATE users SET money = ? WHERE id = ?').run(newMoney, userId);

        return interaction.reply({
          content: `🚨 **Pokus o zločin!**\n❌ Chytila tě policie! Platíš pokutu **${fine} Kč**.`,
          ephemeral: false
        });
      }
    } catch (error) {
      console.error('Crime command error:', error);
      throw error;
    }
  }
};
