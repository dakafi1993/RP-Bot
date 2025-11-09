import { SlashCommandBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Vytvoř si postavu v RP světě')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('Jméno tvé postavy')
        .setRequired(true)
        .setMinLength(2)
        .setMaxLength(20)
    )
    .addStringOption(option =>
      option.setName('race')
        .setDescription('Vyber rasu')
        .setRequired(true)
        .addChoices(
          { name: '👤 Člověk - vyvážené statistiky', value: 'human' },
          { name: '🧝 Elf - bonus na výdělek', value: 'elf' },
          { name: '🧙 Mág - bonus na XP', value: 'mage' },
          { name: '⚔️ Válečník - bonus při kriminalitě', value: 'warrior' },
          { name: '🦹 Zloděj - bonus při okrádání', value: 'thief' }
        )
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const name = interaction.options.getString('name');
    const race = interaction.options.getString('race');

    try {
      // Kontrola existence uživatele
      const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

      if (result.rows.length > 0) {
        return interaction.reply({ 
          content: 'Už máš postavu!', 
          ephemeral: false 
        });
      }

      // Rasové bonusy
      const raceInfo = {
        human: { name: '👤 Člověk', bonus: 'Vyvážené statistiky' },
        elf: { name: '🧝 Elf', bonus: '+20% výdělek z /work' },
        mage: { name: '🧙 Mág', bonus: '+50% XP' },
        warrior: { name: '⚔️ Válečník', bonus: '+30% šance v /crime' },
        thief: { name: '🦹 Zloděj', bonus: '+20% šance v /rob' }
      };

      // Vytvoření nové postavy
      await db.query(
        'INSERT INTO users (id, name, race, money, xp, level, last_daily, work_boost, rob_protection, wins, losses) VALUES ($1, $2, $3, 0, 0, 1, 0, 0, 0, 0, 0)',
        [userId, name, race]
      );

      await interaction.reply({
        content: `✅ **Postava vytvořena!**\n\n` +
                 `📝 **Jméno:** ${name}\n` +
                 `🎭 **Rasa:** ${raceInfo[race].name}\n` +
                 `🎁 **Bonus:** ${raceInfo[race].bonus}\n\n` +
                 `Začínáš s 0 Kč. Použij \`/work\` nebo \`/daily\` pro výdělek!`,
        ephemeral: false
      });
    } catch (error) {
      console.error('Create command error:', error);
      throw error;
    }
  }
};
