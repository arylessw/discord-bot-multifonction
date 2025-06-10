const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'close',
  description: 'Configurer la fermeture des tickets',
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
          close: {
            enabled: false,
            message: 'Ce ticket a été fermé.',
            logChannel: null,
            embed: {
              color: '#ff0000',
              title: 'Ticket fermé',
              footer: 'Système de tickets'
            }
          }
        };
      }

      if (!config[message.guild.id].close) {
        config[message.guild.id].close = {
          enabled: false,
          message: 'Ce ticket a été fermé.',
          logChannel: null,
          embed: {
            color: '#ff0000',
            title: 'Ticket fermé',
            footer: 'Système de tickets'
          }
        };
      }

      if (!args[0]) {
        const logChannel = config[message.guild.id].close.logChannel 
          ? `<#${config[message.guild.id].close.logChannel}>` 
          : 'Non configuré';

        return message.reply(
          'Configuration actuelle de la fermeture des tickets:\n' +
          `Activé: ${config[message.guild.id].close.enabled ? '✅' : '❌'}\n` +
          `Message: ${config[message.guild.id].close.message}\n` +
          `Canal de logs: ${logChannel}\n` +
          `Couleur de l'embed: ${config[message.guild.id].close.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].close.embed.title}\n` +
          `Pied de page: ${config[message.guild.id].close.embed.footer}\n\n` +
          'Commandes disponibles:\n' +
          '`close enable` - Activer la fermeture automatique\n' +
          '`close disable` - Désactiver la fermeture automatique\n' +
          '`close message <message>` - Définir le message\n' +
          '`close logchannel <#channel>` - Définir le canal de logs\n' +
          '`close color <couleur>` - Définir la couleur de l\'embed\n' +
          '`close title <titre>` - Définir le titre de l\'embed\n' +
          '`close footer <texte>` - Définir le pied de page'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].close.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La fermeture automatique a été activée.');
          break;

        case 'disable':
          config[message.guild.id].close.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La fermeture automatique a été désactivée.');
          break;

        case 'message':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].close.message = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message a été mis à jour.');
          break;

        case 'logchannel':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].close.logChannel = logChannel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de logs a été défini sur ${logChannel.name}`);
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #ff0000).');
          }
          config[message.guild.id].close.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].close.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].close.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration de la fermeture des tickets:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
