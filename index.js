import { Client, GatewayIntentBits, Collection, REST, Routes } from 'discord.js';
import Database from 'better-sqlite3';
import { config } from 'dotenv';
import { readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds]
});

// Inicializace databáze
const db = new Database('database.sqlite');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    money INTEGER DEFAULT 0,
    xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    last_daily INTEGER DEFAULT 0,
    work_boost INTEGER DEFAULT 0,
    rob_protection INTEGER DEFAULT 0,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0
  )
`);

console.log('Database initialized');

// Načtení příkazů
client.commands = new Collection();
const commands = [];

const commandsPath = join(__dirname, 'commands');
const commandFiles = readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = join(commandsPath, file);
  const command = await import(`file://${filePath}`);
  client.commands.set(command.default.data.name, command.default);
  commands.push(command.default.data.toJSON());
}

console.log(`Loaded ${commands.length} commands`);

client.once('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  
  const rest = new REST().setToken(process.env.TOKEN);
  
  try {
    console.log('Registering slash commands...');
    
    // Globální registrace - funguje na všech serverech, kde je bot
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    
    console.log('Slash commands registered successfully');
  } catch (error) {
    console.error('Error registering commands:', error);
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isChatInputCommand()) {
    const command = client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.execute(interaction, db);
    } catch (error) {
      console.error('Command error:', error);
      
      const reply = { content: 'Při provádění příkazu došlo k chybě.', ephemeral: true };
      
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp(reply);
      } else {
        await interaction.reply(reply);
      }
    }
  } else if (interaction.isButton()) {
    // Button handler pro blackjack
    if (interaction.customId.startsWith('bj_')) {
      const blackjackCommand = client.commands.get('blackjack');
      if (blackjackCommand && blackjackCommand.handleBlackjackButton) {
        try {
          await blackjackCommand.handleBlackjackButton(interaction);
        } catch (error) {
          console.error('Button error:', error);
        }
      }
    }
  }
});

client.login(process.env.TOKEN);
