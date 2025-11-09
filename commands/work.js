import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('work')
    .setDescription('Pracuj a vyděláj peníze a XP'),
  
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

      // Kontrola cooldownu (1 minuta)
      const now = Date.now();
      const cooldown = 60 * 1000; // 1 minuta
      const timeSinceLastWork = now - (user.last_work || 0);

      if (timeSinceLastWork < cooldown) {
        const timeLeft = cooldown - timeSinceLastWork;
        const secondsLeft = Math.ceil(timeLeft / 1000);

        return interaction.reply({
          content: `⏰ Musíš počkat ještě **${secondsLeft} sekund** než můžeš pracovat znovu!`,
          ephemeral: true
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
      
      // Elf rasový bonus (+20% výdělek)
      if (user.race === 'elf') {
        moneyEarned = Math.floor(moneyEarned * 1.2);
      }
      
      // Kontrola work boost
      let boostActive = false;
      if (user.work_boost > Date.now()) {
        moneyEarned *= 2;
        boostActive = true;
      }
      
      // Mage rasový bonus (+50% XP)
      let xpEarned = Math.floor(Math.random() * 10) + 1;
      if (user.race === 'mage') {
        xpEarned = Math.floor(xpEarned * 1.5);
      }

      let newXp = user.xp + xpEarned;
      let newMoney = user.money + moneyEarned;
      let newLevel = user.level;
      let leveledUp = false;

      if (newXp >= 100) {
        newLevel++;
        newXp = 0;
        leveledUp = true;
      }

      await db.query(
        'UPDATE users SET money = $1, xp = $2, level = $3, last_work = $4 WHERE id = $5',
        [newMoney, newXp, newLevel, now, userId]
      );

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
