const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autopublish',
  description: 'Configurer la publication automatique des messages',
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
          autopublish: {
            enabled: false,
            channels: []
          }
        };
      }

      if (!config[message.guild.id].autopublish) {
        config[message.guild.id].autopublish = {
          enabled: false,
          channels: []
        };
      }

      if (!args[0]) {
        const channels = config[message.guild.id].autopublish.channels
          .map(c => `<#${c}>`)
          .join(', ') || 'Aucun canal configuré';

        return message.reply(
          'Configuration actuelle de la publication automatique:\n' +
          `Activé: ${config[message.guild.id].autopublish.enabled ? '✅' : '❌'}\n` +
          `Canaux: ${channels}\n\n` +
          'Commandes disponibles:\n' +
          '`autopublish enable` - Activer la publication automatique\n' +
          '`autopublish disable` - Désactiver la publication automatique\n' +
          '`autopublish add <#channel>` - Ajouter un canal\n' +
          '`autopublish remove <#channel>` - Supprimer un canal\n' +
          '`autopublish list` - Lister les canaux configurés'
        );
      }

      const subCommand = args[0].toLowerCase();
      const channel = message.mentions.channels.first();

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].autopublish.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La publication automatique a été activée.');
          break;

        case 'disable':
          config[message.guild.id].autopublish.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La publication automatique a été désactivée.');
          break;

        case 'add':
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          if (config[message.guild.id].autopublish.channels.includes(channel.id)) {
            return message.reply('Ce canal est déjà configuré pour la publication automatique.');
          }
          config[message.guild.id].autopublish.channels.push(channel.id);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal ${channel.name} a été ajouté à la liste des canaux de publication automatique.`);
          break;

        case 'remove':
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          const index = config[message.guild.id].autopublish.channels.indexOf(channel.id);
          if (index === -1) {
            return message.reply('Ce canal n\'est pas configuré pour la publication automatique.');
          }
          config[message.guild.id].autopublish.channels.splice(index, 1);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal ${channel.name} a été retiré de la liste des canaux de publication automatique.`);
          break;

        case 'list':
          const channelList = config[message.guild.id].autopublish.channels
            .map(c => `<#${c}>`)
            .join(', ') || 'Aucun canal configuré';
          message.reply(
            'Canaux configurés pour la publication automatique:\n' +
            channelList
          );
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration de la publication automatique:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
