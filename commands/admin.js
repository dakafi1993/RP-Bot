import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

// Seznam admin User IDs (můžeš přidávat další)
const ADMIN_USER_IDS = ['1436690629949263964'];

export default {
  data: new SlashCommandBuilder()
    .setName('admin')
    .setDescription('Admin příkazy pro správu hráčů')
    .addSubcommand(subcommand =>
      subcommand
        .setName('addmoney')
        .setDescription('Přidej hráči peníze')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Částka')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('removemoney')
        .setDescription('Odeber hráči peníze (pokuta)')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Částka')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('Důvod pokuty')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setmoney')
        .setDescription('Nastav hráči přesnou částku')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Částka')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('Zkontroluj profil hráče')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
    ),
  
  async execute(interaction, db) {
    try {
      // Kontrola admin User ID
      const userId = interaction.user.id;
      
      console.log(`Admin check: User ID = ${userId}, Allowed IDs = ${ADMIN_USER_IDS.join(', ')}`);
      
      if (!ADMIN_USER_IDS.includes(userId)) {
        return interaction.reply({
          content: `❌ Nemáš oprávnění používat admin příkazy!\nTvoje ID: ${userId}`,
          ephemeral: true
        });
      }

      const subcommand = interaction.options.getSubcommand();
      const targetUser = interaction.options.getUser('user');
      const amount = interaction.options.getInteger('amount');

      // Kontrola existence uživatele v databázi
      const result = await db.query('SELECT * FROM users WHERE id = $1', [targetUser.id]);
      const user = result.rows[0];

      if (!user && subcommand !== 'check') {
        return interaction.reply({
          content: `❌ ${targetUser.username} ještě nemá postavu!`,
          ephemeral: true
        });
      }

      switch (subcommand) {
        case 'addmoney': {
          const newMoney = user.money + amount;
          await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Peníze přidány')
            .setDescription(`Admin **${interaction.user.username}** přidal peníze`)
            .addFields(
              { name: 'Hráč', value: targetUser.username, inline: true },
              { name: 'Částka', value: `+${amount} Kč`, inline: true },
              { name: 'Nový zůstatek', value: `${newMoney} Kč`, inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'removemoney': {
          const reason = interaction.options.getString('reason') || 'Porušení pravidel';
          const newMoney = Math.max(0, user.money - amount);
          await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🚨 Pokuta')
            .setDescription(`Admin **${interaction.user.username}** udělil pokutu`)
            .addFields(
              { name: 'Hráč', value: targetUser.username, inline: true },
              { name: 'Pokuta', value: `-${amount} Kč`, inline: true },
              { name: 'Nový zůstatek', value: `${newMoney} Kč`, inline: true },
              { name: 'Důvod', value: reason, inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'setmoney': {
          await db.query('UPDATE users SET money = $1 WHERE id = $2', [amount, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0x3498DB)
            .setTitle('💰 Peníze nastaveny')
            .setDescription(`Admin **${interaction.user.username}** nastavil peníze`)
            .addFields(
              { name: 'Hráč', value: targetUser.username, inline: true },
              { name: 'Nová částka', value: `${amount} Kč`, inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'check': {
          if (!user) {
            return interaction.reply({
              content: `❌ ${targetUser.username} ještě nemá postavu!`,
              ephemeral: true
            });
          }

          const rank = user.level >= 50 ? '🏆 Legenda' :
                       user.level >= 30 ? '👑 Mistr' :
                       user.level >= 20 ? '⭐ Expert' :
                       user.level >= 10 ? '💎 Pokročilý' : '🌱 Nováček';

          const winRate = user.wins + user.losses > 0 
            ? ((user.wins / (user.wins + user.losses)) * 100).toFixed(1) 
            : '0.0';

          const embed = new EmbedBuilder()
            .setColor(0xFFD700)
            .setTitle(`🔍 Admin Check - ${user.name}`)
            .setDescription(`**Rasa:** ${user.race} | **Rank:** ${rank}`)
            .addFields(
              { name: '💰 Peníze', value: `${user.money} Kč`, inline: true },
              { name: '⭐ Level', value: `${user.level}`, inline: true },
              { name: '📊 XP', value: `${user.xp}/100`, inline: true },
              { name: '✅ Výhry', value: `${user.wins}`, inline: true },
              { name: '❌ Prohry', value: `${user.losses}`, inline: true },
              { name: '📈 Winrate', value: `${winRate}%`, inline: true },
              { name: '🆔 User ID', value: targetUser.id, inline: false }
            )
            .setThumbnail(targetUser.displayAvatarURL())
            .setTimestamp();

          await interaction.reply({ embeds: [embed], ephemeral: true });
          break;
        }
      }
    } catch (error) {
      console.error('Admin command error:', error);
      throw error;
    }
  }
};
