const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

const db = new Database('database.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    user_id TEXT PRIMARY KEY,
    character_name TEXT,
    money INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1
  )
`);

client.commands = new Collection();
const commands = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);
  client.commands.set(command.data.name, command);
  commands.push(command.data.toJSON());
}

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  const rest = new REST().setToken(process.env.TOKEN);
  
  try {
    console.log('Registering slash commands...');
    await rest.put(
      Routes.applicationCommands(process.env.CLIENT_ID),
      { body: commands }
    );
    console.log('Slash commands registered successfully.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, db);
  } catch (error) {
    console.error(error);
    await interaction.reply({ content: 'There was an error executing this command.', ephemeral: true });
  }
});

client.login(process.env.TOKEN);
