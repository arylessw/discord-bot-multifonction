const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autoreact',
  description: 'Ajouter/supprimer une réaction automatique sur tous les messages d\'un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const configDir = path.join(__dirname, '../../config');
    const configFile = path.join(configDir, 'server_config.json');

    try {
      // Créer le dossier config s'il n'existe pas
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Charger la configuration existante
      let config = {};
      if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }

      // Initialiser la configuration du serveur si elle n'existe pas
      if (!config[message.guild.id]) {
        config[message.guild.id] = {
          autoReacts: {}
        };
      }

      if (!config[message.guild.id].autoReacts) {
        config[message.guild.id].autoReacts = {};
      }

      if (!args[0]) {
        return message.reply(
          'Commandes disponibles:\n' +
          '`autoreact add <#channel> <emoji>` - Ajouter une réaction automatique\n' +
          '`autoreact remove <#channel> <emoji>` - Supprimer une réaction automatique\n' +
          '`autoreact list` - Voir la liste des réactions automatiques'
        );
      }

      const subCommand = args[0].toLowerCase();

      switch (subCommand) {
        case 'add': {
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }

          const emoji = args[2];
          if (!emoji) {
            return message.reply('Veuillez spécifier un emoji.');
          }

          // Vérifier si l'emoji est valide
          try {
            await message.react(emoji);
            message.reactions.removeAll();
          } catch (error) {
            return message.reply('Veuillez spécifier un emoji valide.');
          }

          if (!config[message.guild.id].autoReacts[channel.id]) {
            config[message.guild.id].autoReacts[channel.id] = [];
          }

          if (config[message.guild.id].autoReacts[channel.id].includes(emoji)) {
            return message.reply('Cette réaction automatique existe déjà pour ce canal.');
          }

          config[message.guild.id].autoReacts[channel.id].push(emoji);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La réaction ${emoji} a été ajoutée automatiquement pour le canal ${channel.name}`);
          break;
        }

        case 'remove': {
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }

          const emoji = args[2];
          if (!emoji) {
            return message.reply('Veuillez spécifier un emoji.');
          }

          if (!config[message.guild.id].autoReacts[channel.id] || 
              !config[message.guild.id].autoReacts[channel.id].includes(emoji)) {
            return message.reply('Cette réaction automatique n\'existe pas pour ce canal.');
          }

          config[message.guild.id].autoReacts[channel.id] = 
            config[message.guild.id].autoReacts[channel.id].filter(e => e !== emoji);

          if (config[message.guild.id].autoReacts[channel.id].length === 0) {
            delete config[message.guild.id].autoReacts[channel.id];
          }

          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La réaction ${emoji} a été supprimée automatiquement pour le canal ${channel.name}`);
          break;
        }

        case 'list': {
          const autoReacts = config[message.guild.id].autoReacts;
          if (Object.keys(autoReacts).length === 0) {
            return message.reply('Aucune réaction automatique n\'est configurée.');
          }

          let response = 'Liste des réactions automatiques:\n';
          for (const [channelId, reactions] of Object.entries(autoReacts)) {
            const channel = message.guild.channels.cache.get(channelId);
            if (channel) {
              response += `\n#${channel.name}:\n`;
              reactions.forEach(emoji => {
                response += `- ${emoji}\n`;
              });
            }
          }
          message.reply(response);
          break;
        }

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des réactions automatiques:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
}; 