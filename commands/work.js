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

      // Animace práce
      const working = new EmbedBuilder()
        .setColor(0x3498DB)
        .setTitle('💼 Práce')
        .setDescription('```\n⏳ Pracuješ...\n```')
        .setTimestamp();

      const msg = await interaction.reply({ embeds: [working], fetchReply: true, ephemeral: false });

      await new Promise(resolve => setTimeout(resolve, 1500));

      const jobs = [
        { name: 'Pracoval jsi jako programátor', pay: [150, 300], emoji: '💻' },
        { name: 'Dělal jsi doručovatele pizzy', pay: [80, 150], emoji: '🍕' },
        { name: 'Úklid v kanceláři', pay: [50, 120], emoji: '🧹' },
        { name: 'Hlídal jsi děti', pay: [100, 200], emoji: '👶' },
        { name: 'Pracoval jsi na stavbě', pay: [120, 250], emoji: '🏗️' },
        { name: 'Servíroval jsi v restauraci', pay: [90, 180], emoji: '🍽️' }
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

      const embed = new EmbedBuilder()
        .setColor(0x2ECC71)
        .setTitle(`${job.emoji} Práce`)
        .setDescription(`**${job.name}**`)
        .addFields(
          { name: '💰 Výdělek', value: `${moneyEarned} Kč`, inline: true },
          { name: '⭐ XP', value: `+${xpEarned} XP`, inline: true },
          { name: '💳 Zůstatek', value: `${newMoney} Kč`, inline: true }
        )
        .setTimestamp();
      
      if (boostActive) {
        embed.setFooter({ text: '🔧 Work Boost aktivní (2x výdělek)' });
      }
      
      if (leveledUp) {
        embed.addFields({ name: '🎉 LEVEL UP!', value: `Nyní jsi level **${newLevel}**!`, inline: false });
      }

      await msg.edit({ embeds: [embed] });
    } catch (error) {
      console.error('Work command error:', error);
      throw error;
    }
  }
};
