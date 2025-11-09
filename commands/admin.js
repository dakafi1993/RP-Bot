import { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } from 'discord.js';

// Seznam admin User IDs (plná práva)
const ADMIN_USER_IDS = ['1436690629949263964'];

// Seznam moderátor User IDs (omezená práva - max 50000 Kč)
const MODERATOR_USER_IDS = [
  '1404534814857494708', // Moderátor
];

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
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('addxp')
        .setDescription('Přidej hráči XP')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('amount')
            .setDescription('Počet XP')
            .setRequired(true)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setpickaxe')
        .setDescription('Nastav hráči krumpáč')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('pickaxe')
            .setDescription('Typ krumpáče')
            .setRequired(true)
            .addChoices(
              { name: '🪵 Dřevěný', value: 'wooden' },
              { name: '⚙️ Železný', value: 'iron' },
              { name: '💎 Diamantový', value: 'diamond' }
            )
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('addores')
        .setDescription('Přidej hráči kovy')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
        .addIntegerOption(option =>
          option.setName('iron')
            .setDescription('Železo')
            .setRequired(false)
        )
        .addIntegerOption(option =>
          option.setName('copper')
            .setDescription('Měď')
            .setRequired(false)
        )
        .addIntegerOption(option =>
          option.setName('gold')
            .setDescription('Zlato')
            .setRequired(false)
        )
        .addIntegerOption(option =>
          option.setName('diamond')
            .setDescription('Diamant')
            .setRequired(false)
        )
    )
    .addSubcommand(subcommand =>
      subcommand
        .setName('setrealm')
        .setDescription('Nastav hráči říši')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('Hráč')
            .setRequired(true)
        )
        .addStringOption(option =>
          option.setName('realm')
            .setDescription('Říše')
            .setRequired(true)
            .addChoices(
              { name: '🏛️ Starodávná', value: 'ancient' },
              { name: '🏰 Středověká', value: 'medieval' },
              { name: '🎨 Renesanční', value: 'renaissance' },
              { name: '🏙️ Moderní', value: 'modern' },
              { name: '🚀 Futuristická', value: 'futuristic' }
            )
        )
    ),
  
  async execute(interaction, db) {
    try {
      // Kontrola admin/moderátor User ID
      const userId = interaction.user.id;
      const isAdmin = ADMIN_USER_IDS.includes(userId);
      const isModerator = MODERATOR_USER_IDS.includes(userId);
      
      console.log(`Admin check: User ID = ${userId}, Admin = ${isAdmin}, Moderator = ${isModerator}`);
      
      if (!isAdmin && !isModerator) {
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
          // Moderátor limit 50000 Kč
          if (isModerator && !isAdmin && amount > 50000) {
            return interaction.reply({
              content: '❌ Moderátoři mohou přidat maximálně 50,000 Kč!',
              ephemeral: true
            });
          }

          const newMoney = user.money + amount;
          await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0x2ECC71)
            .setTitle('✅ Peníze přidány')
            .setDescription(`${isAdmin ? 'Admin' : 'Moderátor'} **${interaction.user.username}** přidal peníze`)
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
          // Admin nebo moderátor může odebírat peníze
          if (!isAdmin && !isModerator) {
            return interaction.reply({
              content: '❌ Nemáš oprávnění odebírat peníze!',
              ephemeral: true
            });
          }

          // Moderátor nemůže odebrat peníze adminovi
          if (isModerator && !isAdmin && ADMIN_USER_IDS.includes(targetUser.id)) {
            return interaction.reply({
              content: '❌ Moderátor nemůže odebrat peníze adminovi!',
              ephemeral: true
            });
          }

          const reason = interaction.options.getString('reason') || 'Porušení pravidel';
          const newMoney = Math.max(0, user.money - amount);
          await db.query('UPDATE users SET money = $1 WHERE id = $2', [newMoney, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0xE74C3C)
            .setTitle('🚨 Pokuta')
            .setDescription(`${isAdmin ? 'Admin' : 'Moderátor'} **${interaction.user.username}** udělil pokutu`)
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
          // Pouze admin může nastavovat peníze
          if (!isAdmin) {
            return interaction.reply({
              content: '❌ Pouze admin může nastavovat peníze!',
              ephemeral: true
            });
          }

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

        case 'addxp': {
          // Pouze admin může přidávat XP
          if (!isAdmin) {
            return interaction.reply({
              content: '❌ Pouze admin může přidávat XP!',
              ephemeral: true
            });
          }

          if (!user) {
            return interaction.reply({
              content: `❌ ${targetUser.username} ještě nemá postavu!`,
              ephemeral: true
            });
          }

          let newXP = user.xp + amount;
          let newLevel = user.level;

          // Level up pokud má přes 100 XP
          while (newXP >= 100) {
            newXP -= 100;
            newLevel += 1;
          }

          await db.query('UPDATE users SET xp = $1, level = $2 WHERE id = $3', [newXP, newLevel, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('✨ XP přidány')
            .setDescription(`Admin **${interaction.user.username}** přidal XP`)
            .addFields(
              { name: 'Hráč', value: targetUser.username, inline: true },
              { name: 'XP', value: `+${amount} XP`, inline: true },
              { name: 'Level', value: `${user.level} → ${newLevel}`, inline: true },
              { name: 'Nové XP', value: `${newXP}/100`, inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'setpickaxe': {
          // Pouze admin může nastavovat krumpáče
          if (!isAdmin) {
            return interaction.reply({
              content: '❌ Pouze admin může nastavovat krumpáče!',
              ephemeral: true
            });
          }

          if (!user) {
            return interaction.reply({
              content: `❌ ${targetUser.username} ještě nemá postavu!`,
              ephemeral: true
            });
          }

          const pickaxeType = interaction.options.getString('pickaxe');
          const pickaxeNames = {
            wooden: '🪵 Dřevěný krumpáč',
            iron: '⚙️ Železný krumpáč',
            diamond: '💎 Diamantový krumpáč'
          };

          await db.query('UPDATE users SET pickaxe = $1 WHERE id = $2', [pickaxeType, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0xE67E22)
            .setTitle('⛏️ Krumpáč nastaven')
            .setDescription(`Admin **${interaction.user.username}** nastavil krumpáč`)
            .addFields(
              { name: 'Hráč', value: targetUser.username, inline: true },
              { name: 'Krumpáč', value: pickaxeNames[pickaxeType], inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'addores': {
          // Pouze admin může přidávat kovy
          if (!isAdmin) {
            return interaction.reply({
              content: '❌ Pouze admin může přidávat kovy!',
              ephemeral: true
            });
          }

          if (!user) {
            return interaction.reply({
              content: `❌ ${targetUser.username} ještě nemá postavu!`,
              ephemeral: true
            });
          }

          const iron = interaction.options.getInteger('iron') || 0;
          const copper = interaction.options.getInteger('copper') || 0;
          const gold = interaction.options.getInteger('gold') || 0;
          const diamond = interaction.options.getInteger('diamond') || 0;

          if (iron === 0 && copper === 0 && gold === 0 && diamond === 0) {
            return interaction.reply({
              content: '❌ Musíš zadat alespoň jeden kov!',
              ephemeral: true
            });
          }

          await db.query(
            'UPDATE users SET iron = iron + $1, copper = copper + $2, gold = gold + $3, diamond = diamond + $4 WHERE id = $5',
            [iron, copper, gold, diamond, targetUser.id]
          );

          let oresText = [];
          if (iron > 0) oresText.push(`⚙️ Železo: +${iron}x`);
          if (copper > 0) oresText.push(`🔶 Měď: +${copper}x`);
          if (gold > 0) oresText.push(`🟡 Zlato: +${gold}x`);
          if (diamond > 0) oresText.push(`💎 Diamant: +${diamond}x`);

          const embed = new EmbedBuilder()
            .setColor(0x1ABC9C)
            .setTitle('⛏️ Kovy přidány')
            .setDescription(`Admin **${interaction.user.username}** přidal kovy`)
            .addFields(
              { name: 'Hráč', value: targetUser.username, inline: true },
              { name: 'Kovy', value: oresText.join('\n'), inline: false }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }

        case 'setrealm': {
          // Pouze admin může měnit říše
          if (!isAdmin) {
            return interaction.reply({
              content: '❌ Pouze admin může měnit říše!',
              ephemeral: true
            });
          }

          if (!user) {
            return interaction.reply({
              content: `❌ ${targetUser.username} ještě nemá postavu!`,
              ephemeral: true
            });
          }

          const realm = interaction.options.getString('realm');
          const realmNames = {
            ancient: '🏛️ Starodávná říše',
            medieval: '🏰 Středověká říše',
            renaissance: '🎨 Renesanční říše',
            modern: '🏙️ Moderní říše',
            futuristic: '🚀 Futuristická říše'
          };

          await db.query('UPDATE users SET realm = $1 WHERE id = $2', [realm, targetUser.id]);

          const embed = new EmbedBuilder()
            .setColor(0x9B59B6)
            .setTitle('🌍 Říše nastavena')
            .setDescription(`Admin **${interaction.user.username}** změnil říši`)
            .addFields(
              { name: 'Hráč', value: targetUser.username, inline: true },
              { name: 'Nová říše', value: realmNames[realm], inline: true }
            )
            .setTimestamp();

          await interaction.reply({ embeds: [embed] });
          break;
        }
      }
    } catch (error) {
      console.error('Admin command error:', error);
      throw error;
    }
  }
};
