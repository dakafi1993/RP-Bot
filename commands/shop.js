import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('shop')
    .setDescription('Obchod s upgrady')
    .addStringOption(option =>
      option.setName('item')
        .setDescription('Co chceš koupit?')
        .setRequired(false)
        .addChoices(
          { name: '🔧 Work Boost (2x výdělek z /work) - 5000 Kč', value: 'work_boost' },
          { name: '🛡️ Rob Protection (ochrana před /rob) - 3000 Kč', value: 'rob_protection' }
        )
    ),
  
  async execute(interaction, db) {
    const userId = interaction.user.id;
    const item = interaction.options.getString('item');

    try {
      const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);

      if (!user) {
        return interaction.reply({ 
          content: 'Ještě nemáš postavu! Použij `/create` pro vytvoření.', 
          ephemeral: false 
        });
      }

      // Zobrazení obchodu
      if (!item) {
        const embed = new EmbedBuilder()
          .setColor(0xFF6B35)
          .setTitle('🏪 Obchod')
          .setDescription('Kup si upgrady pro svou postavu!\nPoužij: `/shop item:[název]`')
          .addFields(
            { name: '� Work Boost', value: '**Cena:** 5000 Kč\n**Efekt:** 2x výdělek z `/work` na 7 dní', inline: false },
            { name: '🛡️ Rob Protection', value: '**Cena:** 3000 Kč\n**Efekt:** Ochrana před `/rob` na 5 dní', inline: false }
          )
          .setFooter({ text: `Tvé peníze: ${user.money} Kč` })
          .setTimestamp();

        return interaction.reply({ 
          embeds: [embed],
          ephemeral: false
        });
      }

      // Nákup itemu
      if (item === 'work_boost') {
        if (user.money < 5000) {
          return interaction.reply({
            content: '❌ Nemáš dost peněz! Potřebuješ 5000 Kč.',
            ephemeral: false
          });
        }

        const expiresAt = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 dní
        db.prepare('UPDATE users SET money = money - 5000, work_boost = ? WHERE id = ?')
          .run(expiresAt, userId);

        return interaction.reply({
          content: '✅ Zakoupil jsi **🔧 Work Boost**! Tvůj výdělek z `/work` je nyní 2x na 7 dní.',
          ephemeral: false
        });
      }

      if (item === 'rob_protection') {
        if (user.money < 3000) {
          return interaction.reply({
            content: '❌ Nemáš dost peněz! Potřebuješ 3000 Kč.',
            ephemeral: false
          });
        }

        const expiresAt = Date.now() + (5 * 24 * 60 * 60 * 1000); // 5 dní
        db.prepare('UPDATE users SET money = money - 3000, rob_protection = ? WHERE id = ?')
          .run(expiresAt, userId);

        return interaction.reply({
          content: '✅ Zakoupil jsi **🛡️ Rob Protection**! Jsi chráněn před okradením na 5 dní.',
          ephemeral: false
        });
      }
    } catch (error) {
      console.error('Shop command error:', error);
      throw error;
    }
  }
};
