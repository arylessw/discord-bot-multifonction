const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'reminder',
  description: 'Configurer le système de rappels',
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
          reminders: {
            enabled: false,
            channel: null,
            maxReminders: 5,
            maxDuration: 604800, // 7 jours en secondes
            allowEveryone: false,
            allowHere: false,
            allowRoles: false,
            allowedRoles: []
          }
        };
      }

      if (!config[message.guild.id].reminders) {
        config[message.guild.id].reminders = {
          enabled: false,
          channel: null,
          maxReminders: 5,
          maxDuration: 604800,
          allowEveryone: false,
          allowHere: false,
          allowRoles: false,
          allowedRoles: []
        };
      }

      if (!args[0]) {
        const currentChannel = config[message.guild.id].reminders.channel 
          ? `<#${config[message.guild.id].reminders.channel}>` 
          : 'Non configuré';
        const allowedRoles = config[message.guild.id].reminders.allowedRoles
          .map(roleId => `<@&${roleId}>`)
          .join(', ') || 'Aucun';

        return message.reply(
          'Configuration actuelle des rappels:\n' +
          `Activé: ${config[message.guild.id].reminders.enabled ? '✅' : '❌'}\n` +
          `Canal: ${currentChannel}\n` +
          `Rappels max par utilisateur: ${config[message.guild.id].reminders.maxReminders}\n` +
          `Durée max: ${config[message.guild.id].reminders.maxDuration / 86400} jours\n` +
          `@everyone autorisé: ${config[message.guild.id].reminders.allowEveryone ? '✅' : '❌'}\n` +
          `@here autorisé: ${config[message.guild.id].reminders.allowHere ? '✅' : '❌'}\n` +
          `Mentions de rôles autorisées: ${config[message.guild.id].reminders.allowRoles ? '✅' : '❌'}\n` +
          `Rôles autorisés: ${allowedRoles}\n\n` +
          'Commandes disponibles:\n' +
          '`reminder enable` - Activer le système de rappels\n' +
          '`reminder disable` - Désactiver le système de rappels\n' +
          '`reminder channel #canal` - Définir le canal des rappels\n' +
          '`reminder max <nombre>` - Définir le nombre max de rappels\n' +
          '`reminder duration <jours>` - Définir la durée max des rappels\n' +
          '`reminder everyone on/off` - Activer/désactiver @everyone\n' +
          '`reminder here on/off` - Activer/désactiver @here\n' +
          '`reminder roles on/off` - Activer/désactiver les mentions de rôles\n' +
          '`reminder addrole @rôle` - Ajouter un rôle autorisé\n' +
          '`reminder removerole @rôle` - Retirer un rôle autorisé'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].reminders.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de rappels a été activé.');
          break;

        case 'disable':
          config[message.guild.id].reminders.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de rappels a été désactivé.');
          break;

        case 'channel':
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].reminders.channel = channel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal des rappels a été défini sur ${channel.name}`);
          break;

        case 'max':
          const maxReminders = parseInt(value);
          if (isNaN(maxReminders) || maxReminders < 1) {
            return message.reply('Le nombre maximum de rappels doit être un nombre supérieur à 0.');
          }
          config[message.guild.id].reminders.maxReminders = maxReminders;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le nombre maximum de rappels a été défini sur ${maxReminders}`);
          break;

        case 'duration':
          const maxDuration = parseInt(value);
          if (isNaN(maxDuration) || maxDuration < 1) {
            return message.reply('La durée maximale doit être un nombre de jours supérieur à 0.');
          }
          config[message.guild.id].reminders.maxDuration = maxDuration * 86400; // Convertir en secondes
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La durée maximale des rappels a été définie sur ${maxDuration} jours`);
          break;

        case 'everyone':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver @everyone.');
          }
          config[message.guild.id].reminders.allowEveryone = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ @everyone a été ${value.toLowerCase() === 'on' ? 'autorisé' : 'interdit'}`);
          break;

        case 'here':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver @here.');
          }
          config[message.guild.id].reminders.allowHere = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ @here a été ${value.toLowerCase() === 'on' ? 'autorisé' : 'interdit'}`);
          break;

        case 'roles':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver les mentions de rôles.');
          }
          config[message.guild.id].reminders.allowRoles = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Les mentions de rôles ont été ${value.toLowerCase() === 'on' ? 'autorisées' : 'interdites'}`);
          break;

        case 'addrole':
          const roleToAdd = message.mentions.roles.first();
          if (!roleToAdd) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          if (!config[message.guild.id].reminders.allowedRoles.includes(roleToAdd.id)) {
            config[message.guild.id].reminders.allowedRoles.push(roleToAdd.id);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ Le rôle ${roleToAdd.name} a été ajouté à la liste des rôles autorisés.`);
          } else {
            message.reply('Ce rôle est déjà dans la liste des rôles autorisés.');
          }
          break;

        case 'removerole':
          const roleToRemove = message.mentions.roles.first();
          if (!roleToRemove) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          const roleIndex = config[message.guild.id].reminders.allowedRoles.indexOf(roleToRemove.id);
          if (roleIndex > -1) {
            config[message.guild.id].reminders.allowedRoles.splice(roleIndex, 1);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ Le rôle ${roleToRemove.name} a été retiré de la liste des rôles autorisés.`);
          } else {
            message.reply('Ce rôle n\'est pas dans la liste des rôles autorisés.');
          }
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des rappels:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
