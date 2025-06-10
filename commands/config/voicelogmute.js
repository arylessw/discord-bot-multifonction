const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'voicelogmute',
  description: 'Configurer les logs de mute vocal',
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
          voicelogmute: {
            enabled: false,
            channel: null,
            message: '{user} a été mute dans {channel}',
            embed: {
              enabled: true,
              color: '#ff0000',
              title: 'Mute vocal',
              description: '{user} a été mute dans {channel}',
              thumbnail: true,
              footer: 'Logs vocaux'
            }
          }
        };
      }

      if (!config[message.guild.id].voicelogmute) {
        config[message.guild.id].voicelogmute = {
          enabled: false,
          channel: null,
          message: '{user} a été mute dans {channel}',
          embed: {
            enabled: true,
            color: '#ff0000',
            title: 'Mute vocal',
            description: '{user} a été mute dans {channel}',
            thumbnail: true,
            footer: 'Logs vocaux'
          }
        };
      }

      if (!args[0]) {
        const currentChannel = config[message.guild.id].voicelogmute.channel 
          ? `<#${config[message.guild.id].voicelogmute.channel}>` 
          : 'Non configuré';

        return message.reply(
          'Configuration actuelle des logs de mute vocal:\n' +
          `Activé: ${config[message.guild.id].voicelogmute.enabled ? '✅' : '❌'}\n` +
          `Canal: ${currentChannel}\n` +
          `Message: ${config[message.guild.id].voicelogmute.message}\n` +
          `Embed activé: ${config[message.guild.id].voicelogmute.embed.enabled ? '✅' : '❌'}\n` +
          `Couleur de l'embed: ${config[message.guild.id].voicelogmute.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].voicelogmute.embed.title}\n` +
          `Description de l'embed: ${config[message.guild.id].voicelogmute.embed.description}\n` +
          `Miniature: ${config[message.guild.id].voicelogmute.embed.thumbnail ? '✅' : '❌'}\n` +
          `Pied de page: ${config[message.guild.id].voicelogmute.embed.footer}\n\n` +
          'Variables disponibles:\n' +
          '`{user}` - Mention de l\'utilisateur\n' +
          '`{username}` - Nom de l\'utilisateur\n' +
          '`{channel}` - Nom du salon\n' +
          '`{time}` - Heure du mute\n' +
          '`{moderator}` - Modérateur qui a mute\n\n' +
          'Commandes disponibles:\n' +
          '`voicelogmute enable` - Activer les logs\n' +
          '`voicelogmute disable` - Désactiver les logs\n' +
          '`voicelogmute channel #canal` - Définir le canal\n' +
          '`voicelogmute message <message>` - Définir le message\n' +
          '`voicelogmute embed on/off` - Activer/désactiver l\'embed\n' +
          '`voicelogmute color <couleur>` - Définir la couleur de l\'embed\n' +
          '`voicelogmute title <titre>` - Définir le titre de l\'embed\n' +
          '`voicelogmute description <description>` - Définir la description de l\'embed\n' +
          '`voicelogmute thumbnail on/off` - Activer/désactiver la miniature\n' +
          '`voicelogmute footer <texte>` - Définir le pied de page'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].voicelogmute.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les logs de mute vocal ont été activés.');
          break;

        case 'disable':
          config[message.guild.id].voicelogmute.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les logs de mute vocal ont été désactivés.');
          break;

        case 'channel':
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].voicelogmute.channel = channel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal des logs de mute vocal a été défini sur ${channel.name}`);
          break;

        case 'message':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].voicelogmute.message = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message de log a été mis à jour.');
          break;

        case 'embed':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'embed.');
          }
          config[message.guild.id].voicelogmute.embed.enabled = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'embed a été ${value.toLowerCase() === 'on' ? 'activé' : 'désactivé'}`);
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #ff0000).');
          }
          config[message.guild.id].voicelogmute.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].voicelogmute.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'description':
          if (!value) {
            return message.reply('Veuillez spécifier une description.');
          }
          config[message.guild.id].voicelogmute.embed.description = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La description de l\'embed a été mise à jour.');
          break;

        case 'thumbnail':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver la miniature.');
          }
          config[message.guild.id].voicelogmute.embed.thumbnail = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La miniature a été ${value.toLowerCase() === 'on' ? 'activée' : 'désactivée'}`);
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].voicelogmute.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des logs de mute vocal:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
}; 