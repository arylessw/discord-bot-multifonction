const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autodelete',
  description: 'Configurer la suppression automatique des messages',
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
          autodelete: {
            enabled: false,
            channels: {},
            defaultDelay: 86400, // 24 heures en secondes
            ignoreBots: true,
            ignoreAdmins: true,
            ignoreRoles: [],
            preservePinned: true
          }
        };
      }

      if (!config[message.guild.id].autodelete) {
        config[message.guild.id].autodelete = {
          enabled: false,
          channels: {},
          defaultDelay: 86400,
          ignoreBots: true,
          ignoreAdmins: true,
          ignoreRoles: [],
          preservePinned: true
        };
      }

      if (!args[0]) {
        const channels = Object.entries(config[message.guild.id].autodelete.channels)
          .map(([channelId, settings]) => {
            const channel = message.guild.channels.cache.get(channelId);
            return channel ? 
              `#${channel.name}: ${settings.delay / 3600}h` : 
              `Canal inconnu (${channelId}): ${settings.delay / 3600}h`;
          })
          .join('\n') || 'Aucun canal configuré';

        const ignoredRoles = config[message.guild.id].autodelete.ignoreRoles
          .map(roleId => `<@&${roleId}>`)
          .join(', ') || 'Aucun';

        return message.reply(
          'Configuration actuelle de la suppression automatique:\n' +
          `Activé: ${config[message.guild.id].autodelete.enabled ? '✅' : '❌'}\n` +
          `Délai par défaut: ${config[message.guild.id].autodelete.defaultDelay / 3600} heures\n` +
          `Ignorer les bots: ${config[message.guild.id].autodelete.ignoreBots ? '✅' : '❌'}\n` +
          `Ignorer les admins: ${config[message.guild.id].autodelete.ignoreAdmins ? '✅' : '❌'}\n` +
          `Préserver les messages épinglés: ${config[message.guild.id].autodelete.preservePinned ? '✅' : '❌'}\n` +
          `Rôles ignorés: ${ignoredRoles}\n\n` +
          'Canaux configurés:\n' +
          channels + '\n\n' +
          'Commandes disponibles:\n' +
          '`autodelete enable` - Activer la suppression automatique\n' +
          '`autodelete disable` - Désactiver la suppression automatique\n' +
          '`autodelete default <heures>` - Définir le délai par défaut\n' +
          '`autodelete channel #canal <heures>` - Configurer un canal\n' +
          '`autodelete remove #canal` - Retirer un canal\n' +
          '`autodelete bots on/off` - Activer/désactiver l\'ignorance des bots\n' +
          '`autodelete admins on/off` - Activer/désactiver l\'ignorance des admins\n' +
          '`autodelete pinned on/off` - Activer/désactiver la préservation des messages épinglés\n' +
          '`autodelete addrole @rôle` - Ajouter un rôle ignoré\n' +
          '`autodelete removerole @rôle` - Retirer un rôle ignoré'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].autodelete.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La suppression automatique a été activée.');
          break;

        case 'disable':
          config[message.guild.id].autodelete.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ La suppression automatique a été désactivée.');
          break;

        case 'default':
          const defaultDelay = parseFloat(value);
          if (isNaN(defaultDelay) || defaultDelay < 0.1) {
            return message.reply('Le délai par défaut doit être un nombre d\'heures supérieur à 0.1.');
          }
          config[message.guild.id].autodelete.defaultDelay = defaultDelay * 3600; // Convertir en secondes
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le délai par défaut a été défini sur ${defaultDelay} heures.`);
          break;

        case 'channel':
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          const delay = parseFloat(args[args.length - 1]);
          if (isNaN(delay) || delay < 0.1) {
            return message.reply('Le délai doit être un nombre d\'heures supérieur à 0.1.');
          }
          config[message.guild.id].autodelete.channels[channel.id] = {
            delay: delay * 3600 // Convertir en secondes
          };
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal ${channel.name} a été configuré avec un délai de ${delay} heures.`);
          break;

        case 'remove':
          const channelToRemove = message.mentions.channels.first();
          if (!channelToRemove) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          if (config[message.guild.id].autodelete.channels[channelToRemove.id]) {
            delete config[message.guild.id].autodelete.channels[channelToRemove.id];
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ Le canal ${channelToRemove.name} a été retiré de la configuration.`);
          } else {
            message.reply('Ce canal n\'est pas configuré pour la suppression automatique.');
          }
          break;

        case 'bots':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'ignorance des bots.');
          }
          config[message.guild.id].autodelete.ignoreBots = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'ignorance des bots a été ${value.toLowerCase() === 'on' ? 'activée' : 'désactivée'}.`);
          break;

        case 'admins':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'ignorance des admins.');
          }
          config[message.guild.id].autodelete.ignoreAdmins = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'ignorance des admins a été ${value.toLowerCase() === 'on' ? 'activée' : 'désactivée'}.`);
          break;

        case 'pinned':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver la préservation des messages épinglés.');
          }
          config[message.guild.id].autodelete.preservePinned = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La préservation des messages épinglés a été ${value.toLowerCase() === 'on' ? 'activée' : 'désactivée'}.`);
          break;

        case 'addrole':
          const roleToAdd = message.mentions.roles.first();
          if (!roleToAdd) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          if (!config[message.guild.id].autodelete.ignoreRoles.includes(roleToAdd.id)) {
            config[message.guild.id].autodelete.ignoreRoles.push(roleToAdd.id);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ Le rôle ${roleToAdd.name} a été ajouté à la liste des rôles ignorés.`);
          } else {
            message.reply('Ce rôle est déjà dans la liste des rôles ignorés.');
          }
          break;

        case 'removerole':
          const roleToRemove = message.mentions.roles.first();
          if (!roleToRemove) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          const roleIndex = config[message.guild.id].autodelete.ignoreRoles.indexOf(roleToRemove.id);
          if (roleIndex > -1) {
            config[message.guild.id].autodelete.ignoreRoles.splice(roleIndex, 1);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ Le rôle ${roleToRemove.name} a été retiré de la liste des rôles ignorés.`);
          } else {
            message.reply('Ce rôle n\'est pas dans la liste des rôles ignorés.');
          }
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration de la suppression automatique:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
