const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'twitch',
  description: 'Configurer les notifications Twitch',
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
          twitch: {
            enabled: false,
            channel: null,
            streamers: [],
            message: '{user} est en live sur Twitch !\n{url}',
            embed: {
              enabled: true,
              color: '#6441a5',
              title: '{user} est en live !',
              description: '{title}',
              thumbnail: true,
              footer: 'Twitch'
            }
          }
        };
      }

      if (!config[message.guild.id].twitch) {
        config[message.guild.id].twitch = {
          enabled: false,
          channel: null,
          streamers: [],
          message: '{user} est en live sur Twitch !\n{url}',
          embed: {
            enabled: true,
            color: '#6441a5',
            title: '{user} est en live !',
            description: '{title}',
            thumbnail: true,
            footer: 'Twitch'
          }
        };
      }

      if (!args[0]) {
        const currentChannel = config[message.guild.id].twitch.channel 
          ? `<#${config[message.guild.id].twitch.channel}>` 
          : 'Non configuré';

        return message.reply(
          'Configuration actuelle des notifications Twitch:\n' +
          `Activé: ${config[message.guild.id].twitch.enabled ? '✅' : '❌'}\n` +
          `Canal: ${currentChannel}\n` +
          `Streamers: ${config[message.guild.id].twitch.streamers.length > 0 ? config[message.guild.id].twitch.streamers.join(', ') : 'Aucun'}\n` +
          `Message: ${config[message.guild.id].twitch.message}\n` +
          `Embed activé: ${config[message.guild.id].twitch.embed.enabled ? '✅' : '❌'}\n` +
          `Couleur de l'embed: ${config[message.guild.id].twitch.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].twitch.embed.title}\n` +
          `Description de l'embed: ${config[message.guild.id].twitch.embed.description}\n` +
          `Miniature: ${config[message.guild.id].twitch.embed.thumbnail ? '✅' : '❌'}\n` +
          `Pied de page: ${config[message.guild.id].twitch.embed.footer}\n\n` +
          'Variables disponibles:\n' +
          '`{user}` - Nom du streamer\n' +
          '`{title}` - Titre du stream\n' +
          '`{url}` - Lien du stream\n' +
          '`{game}` - Jeu en cours\n' +
          '`{viewers}` - Nombre de spectateurs\n\n' +
          'Commandes disponibles:\n' +
          '`twitch enable` - Activer les notifications\n' +
          '`twitch disable` - Désactiver les notifications\n' +
          '`twitch channel #canal` - Définir le canal\n' +
          '`twitch add <streamer>` - Ajouter un streamer\n' +
          '`twitch remove <streamer>` - Retirer un streamer\n' +
          '`twitch list` - Lister les streamers\n' +
          '`twitch message <message>` - Définir le message\n' +
          '`twitch embed on/off` - Activer/désactiver l\'embed\n' +
          '`twitch color <couleur>` - Définir la couleur de l\'embed\n' +
          '`twitch title <titre>` - Définir le titre de l\'embed\n' +
          '`twitch description <description>` - Définir la description de l\'embed\n' +
          '`twitch thumbnail on/off` - Activer/désactiver la miniature\n' +
          '`twitch footer <texte>` - Définir le pied de page'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].twitch.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les notifications Twitch ont été activées.');
          break;

        case 'disable':
          config[message.guild.id].twitch.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les notifications Twitch ont été désactivées.');
          break;

        case 'channel':
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].twitch.channel = channel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal des notifications Twitch a été défini sur ${channel.name}`);
          break;

        case 'add':
          if (!value) {
            return message.reply('Veuillez spécifier un nom de streamer.');
          }
          const streamer = value.toLowerCase();
          if (config[message.guild.id].twitch.streamers.includes(streamer)) {
            return message.reply('Ce streamer est déjà dans la liste.');
          }
          config[message.guild.id].twitch.streamers.push(streamer);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ ${streamer} a été ajouté à la liste des streamers.`);
          break;

        case 'remove':
          if (!value) {
            return message.reply('Veuillez spécifier un nom de streamer.');
          }
          const streamerToRemove = value.toLowerCase();
          if (!config[message.guild.id].twitch.streamers.includes(streamerToRemove)) {
            return message.reply('Ce streamer n\'est pas dans la liste.');
          }
          config[message.guild.id].twitch.streamers = config[message.guild.id].twitch.streamers.filter(s => s !== streamerToRemove);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ ${streamerToRemove} a été retiré de la liste des streamers.`);
          break;

        case 'list':
          if (config[message.guild.id].twitch.streamers.length === 0) {
            return message.reply('Aucun streamer n\'est configuré.');
          }
          message.reply(`Liste des streamers:\n${config[message.guild.id].twitch.streamers.join('\n')}`);
          break;

        case 'message':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].twitch.message = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message de notification a été mis à jour.');
          break;

        case 'embed':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'embed.');
          }
          config[message.guild.id].twitch.embed.enabled = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'embed a été ${value.toLowerCase() === 'on' ? 'activé' : 'désactivé'}`);
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #6441a5).');
          }
          config[message.guild.id].twitch.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].twitch.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'description':
          if (!value) {
            return message.reply('Veuillez spécifier une description.');
          }
          config[message.guild.id].twitch.embed.description = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La description de l\'embed a été mise à jour.');
          break;

        case 'thumbnail':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver la miniature.');
          }
          config[message.guild.id].twitch.embed.thumbnail = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La miniature a été ${value.toLowerCase() === 'on' ? 'activée' : 'désactivée'}`);
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].twitch.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des notifications Twitch:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
