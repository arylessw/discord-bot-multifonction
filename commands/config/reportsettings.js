const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'reportsettings',
  description: 'Configurer le système de signalements',
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
          reports: {
            enabled: false,
            channel: null,
            logChannel: null,
            staffRole: null,
            allowAnonymous: false,
            requireReason: true,
            cooldown: 3600, // 1 heure en secondes
            maxReports: 3, // Nombre maximum de signalements par utilisateur
            autoClose: 604800 // 7 jours en secondes
          }
        };
      }

      if (!config[message.guild.id].reports) {
        config[message.guild.id].reports = {
          enabled: false,
          channel: null,
          logChannel: null,
          staffRole: null,
          allowAnonymous: false,
          requireReason: true,
          cooldown: 3600,
          maxReports: 3,
          autoClose: 604800
        };
      }

      if (!args[0]) {
        const currentChannel = config[message.guild.id].reports.channel 
          ? `<#${config[message.guild.id].reports.channel}>` 
          : 'Non configuré';
        const currentLogChannel = config[message.guild.id].reports.logChannel 
          ? `<#${config[message.guild.id].reports.logChannel}>` 
          : 'Non configuré';
        const currentStaffRole = config[message.guild.id].reports.staffRole 
          ? `<@&${config[message.guild.id].reports.staffRole}>` 
          : 'Non configuré';

        return message.reply(
          'Configuration actuelle des signalements:\n' +
          `Activé: ${config[message.guild.id].reports.enabled ? '✅' : '❌'}\n` +
          `Canal: ${currentChannel}\n` +
          `Canal de logs: ${currentLogChannel}\n` +
          `Rôle staff: ${currentStaffRole}\n` +
          `Signalements anonymes: ${config[message.guild.id].reports.allowAnonymous ? '✅' : '❌'}\n` +
          `Raison requise: ${config[message.guild.id].reports.requireReason ? '✅' : '❌'}\n` +
          `Délai entre les signalements: ${config[message.guild.id].reports.cooldown / 60} minutes\n` +
          `Signalements max par utilisateur: ${config[message.guild.id].reports.maxReports}\n` +
          `Fermeture automatique: ${config[message.guild.id].reports.autoClose / 86400} jours\n\n` +
          'Commandes disponibles:\n' +
          '`reportsettings enable` - Activer le système de signalements\n' +
          '`reportsettings disable` - Désactiver le système de signalements\n' +
          '`reportsettings channel #canal` - Définir le canal des signalements\n' +
          '`reportsettings log #canal` - Définir le canal de logs\n' +
          '`reportsettings role @rôle` - Définir le rôle staff\n' +
          '`reportsettings anonymous on/off` - Activer/désactiver les signalements anonymes\n' +
          '`reportsettings reason on/off` - Activer/désactiver l\'obligation de raison\n' +
          '`reportsettings cooldown <minutes>` - Définir le délai entre les signalements\n' +
          '`reportsettings max <nombre>` - Définir le nombre max de signalements\n' +
          '`reportsettings autoclose <jours>` - Définir la fermeture automatique'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].reports.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de signalements a été activé.');
          break;

        case 'disable':
          config[message.guild.id].reports.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de signalements a été désactivé.');
          break;

        case 'channel':
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].reports.channel = channel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal des signalements a été défini sur ${channel.name}`);
          break;

        case 'log':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].reports.logChannel = logChannel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de logs a été défini sur ${logChannel.name}`);
          break;

        case 'role':
          const role = message.mentions.roles.first();
          if (!role) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          config[message.guild.id].reports.staffRole = role.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle staff a été défini sur ${role.name}`);
          break;

        case 'anonymous':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver les signalements anonymes.');
          }
          config[message.guild.id].reports.allowAnonymous = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Les signalements anonymes ont été ${value.toLowerCase() === 'on' ? 'activés' : 'désactivés'}`);
          break;

        case 'reason':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'obligation de raison.');
          }
          config[message.guild.id].reports.requireReason = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'obligation de raison a été ${value.toLowerCase() === 'on' ? 'activée' : 'désactivée'}`);
          break;

        case 'cooldown':
          const cooldown = parseInt(value);
          if (isNaN(cooldown) || cooldown < 1) {
            return message.reply('Le délai doit être un nombre de minutes supérieur à 0.');
          }
          config[message.guild.id].reports.cooldown = cooldown * 60; // Convertir en secondes
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le délai entre les signalements a été défini sur ${cooldown} minutes`);
          break;

        case 'max':
          const maxReports = parseInt(value);
          if (isNaN(maxReports) || maxReports < 1) {
            return message.reply('Le nombre maximum de signalements doit être un nombre supérieur à 0.');
          }
          config[message.guild.id].reports.maxReports = maxReports;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le nombre maximum de signalements a été défini sur ${maxReports}`);
          break;

        case 'autoclose':
          const autoClose = parseInt(value);
          if (isNaN(autoClose) || autoClose < 1) {
            return message.reply('Le délai de fermeture doit être un nombre de jours supérieur à 0.');
          }
          config[message.guild.id].reports.autoClose = autoClose * 86400; // Convertir en secondes
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La fermeture automatique a été définie sur ${autoClose} jours`);
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des signalements:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
