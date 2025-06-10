const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Charger la configuration
const configPath = path.join(__dirname, 'data/config.json');
let config = { prefixes: { default: '&', custom: {} } };
if (fs.existsSync(configPath)) {
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (error) {
    console.error('Erreur lors du chargement de la configuration:', error);
  }
}

// Créer le client Discord avec les intents nécessaires
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildModeration
  ]
});

// Ajouter la config au client
client.config = config;

// Collection pour stocker les commandes
client.commands = new Collection();

// Fonction pour charger les commandes
function loadCommands() {
  const commandsPath = path.join(__dirname, 'commands');
  
  // Vérifier si le dossier commands existe
  if (!fs.existsSync(commandsPath)) {
    console.error('Le dossier commands n\'existe pas!');
    return;
  }

  // Charger les commandes du dossier principal
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    try {
      const command = require(filePath);
      if ('name' in command && 'execute' in command) {
        client.commands.set(command.name, command);
        console.log(`Commande chargée: ${command.name}`);
      } else {
        console.log(`[AVERTISSEMENT] La commande dans ${file} n'a pas de propriété "name" ou "execute" requise.`);
      }
    } catch (error) {
      console.error(`Erreur lors du chargement de la commande ${file}:`, error);
    }
  }

  // Charger les commandes des sous-dossiers
  const folders = fs.readdirSync(commandsPath).filter(folder => 
    fs.statSync(path.join(commandsPath, folder)).isDirectory()
  );

  for (const folder of folders) {
    const folderPath = path.join(commandsPath, folder);
    const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
      const filePath = path.join(folderPath, file);
      try {
        const command = require(filePath);
        if ('name' in command && 'execute' in command) {
          client.commands.set(command.name, command);
          console.log(`Commande chargée: ${command.name} (${folder})`);
        } else {
          console.log(`[AVERTISSEMENT] La commande dans ${file} n'a pas de propriété "name" ou "execute" requise.`);
        }
      } catch (error) {
        console.error(`Erreur lors du chargement de la commande ${file}:`, error);
      }
    }
  }
}

// Charger les commandes au démarrage
loadCommands();

// Événement ready
client.once('ready', () => {
  console.log(`Bot connecté en tant que ${client.user.tag}`);
  console.log(`Nombre de commandes chargées: ${client.commands.size}`);
  console.log(`Préfixe par défaut: ${client.config.prefixes.default}`);
  client.user.setActivity('Protection Anti-Raid', { type: 'WATCHING' });
});

// Événement messageCreate
client.on('messageCreate', async message => {
  if (message.author.bot) return;

  // Déterminer le préfixe à utiliser
  let prefix = client.config.prefixes.default;
  
  // Si le message est dans un serveur, vérifier s'il y a un préfixe personnalisé
  if (message.guild && client.config.prefixes.custom[message.guild.id]) {
    prefix = client.config.prefixes.custom[message.guild.id];
  }

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    await command.execute(message, args, client);
  } catch (error) {
    console.error(error);
    message.reply({
      embeds: [{
        title: '❌ Erreur',
        description: 'Une erreur est survenue lors de l\'exécution de la commande.',
        color: 0xff0000,
        timestamp: new Date()
      }]
    });
  }
});

// Gestion des erreurs
client.on('error', error => {
  console.error('Erreur Discord.js:', error);
});

process.on('unhandledRejection', error => {
  console.error('Erreur non gérée:', error);
});

// Connexion du bot
client.login(process.env.TOKEN); 