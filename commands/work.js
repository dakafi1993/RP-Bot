import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Pracuj a vyděláj peníze a XP'),
  
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

      const jobs = [
        { name: 'Pracoval jsi jako programátor', pay: [150, 300] },
        { name: 'Dělal jsi doručovatele pizzy', pay: [80, 150] },
        { name: 'Úklid v kanceláři', pay: [50, 120] },
        { name: 'Hlídal jsi děti', pay: [100, 200] },
        { name: 'Pracoval jsi na stavbě', pay: [120, 250] },
        { name: 'Servíroval jsi v restauraci', pay: [90, 180] }
      ];

      const job = jobs[Math.floor(Math.random() * jobs.length)];
      let moneyEarned = Math.floor(Math.random() * (job.pay[1] - job.pay[0])) + job.pay[0];
      
      // Kontrola work boost
      let boostActive = false;
      if (user.work_boost > Date.now()) {
        moneyEarned *= 2;
        boostActive = true;
      }
      
      const xpEarned = Math.floor(Math.random() * 10) + 1;

      let newXp = user.xp + xpEarned;
      let newMoney = user.money + moneyEarned;
      let newLevel = user.level;
      let leveledUp = false;

      if (newXp >= 100) {
        newLevel++;
        newXp = 0;
        leveledUp = true;
      }

      db.prepare('UPDATE users SET money = ?, xp = ?, level = ? WHERE id = ?')
        .run(newMoney, newXp, newLevel, userId);

      let response = `💼 **${job.name}**\nVydělal jsi **${moneyEarned} Kč** a **${xpEarned} XP**!`;
      
      if (boostActive) {
        response += ` 🔧`;
      }
      
      if (leveledUp) {
        response += `\n\n🎉 **LEVEL UP!** Nyní jsi level **${newLevel}**!`;
      }

      await interaction.reply({
        content: response,
        ephemeral: false
      });
    } catch (error) {
      console.error('Work command error:', error);
      throw error;
    }
  }
};
