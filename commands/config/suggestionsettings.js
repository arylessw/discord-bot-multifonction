const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'suggestionsettings',
  description: 'Configurer le système de suggestions',
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
          suggestions: {
            enabled: false,
            channel: null,
            logChannel: null,
            minLength: 10,
            maxLength: 1000,
            requireApproval: true,
            allowAttachments: true,
            allowLinks: true,
            cooldown: 3600 // 1 heure en secondes
          }
        };
      }

      if (!config[message.guild.id].suggestions) {
        config[message.guild.id].suggestions = {
          enabled: false,
          channel: null,
          logChannel: null,
          minLength: 10,
          maxLength: 1000,
          requireApproval: true,
          allowAttachments: true,
          allowLinks: true,
          cooldown: 3600
        };
      }

      if (!args[0]) {
        const currentChannel = config[message.guild.id].suggestions.channel 
          ? `<#${config[message.guild.id].suggestions.channel}>` 
          : 'Non configuré';
        const currentLogChannel = config[message.guild.id].suggestions.logChannel 
          ? `<#${config[message.guild.id].suggestions.logChannel}>` 
          : 'Non configuré';

        return message.reply(
          'Configuration actuelle des suggestions:\n' +
          `Activé: ${config[message.guild.id].suggestions.enabled ? '✅' : '❌'}\n` +
          `Canal: ${currentChannel}\n` +
          `Canal de logs: ${currentLogChannel}\n` +
          `Longueur minimale: ${config[message.guild.id].suggestions.minLength} caractères\n` +
          `Longueur maximale: ${config[message.guild.id].suggestions.maxLength} caractères\n` +
          `Approbation requise: ${config[message.guild.id].suggestions.requireApproval ? '✅' : '❌'}\n` +
          `Pièces jointes autorisées: ${config[message.guild.id].suggestions.allowAttachments ? '✅' : '❌'}\n` +
          `Liens autorisés: ${config[message.guild.id].suggestions.allowLinks ? '✅' : '❌'}\n` +
          `Délai entre les suggestions: ${config[message.guild.id].suggestions.cooldown / 60} minutes\n\n` +
          'Commandes disponibles:\n' +
          '`suggestionsettings enable` - Activer le système de suggestions\n' +
          '`suggestionsettings disable` - Désactiver le système de suggestions\n' +
          '`suggestionsettings channel #canal` - Définir le canal des suggestions\n' +
          '`suggestionsettings log #canal` - Définir le canal de logs\n' +
          '`suggestionsettings minlength <nombre>` - Définir la longueur minimale\n' +
          '`suggestionsettings maxlength <nombre>` - Définir la longueur maximale\n' +
          '`suggestionsettings approval on/off` - Activer/désactiver l\'approbation\n' +
          '`suggestionsettings attachments on/off` - Autoriser/interdire les pièces jointes\n' +
          '`suggestionsettings links on/off` - Autoriser/interdire les liens\n' +
          '`suggestionsettings cooldown <minutes>` - Définir le délai entre les suggestions'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].suggestions.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de suggestions a été activé.');
          break;

        case 'disable':
          config[message.guild.id].suggestions.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le système de suggestions a été désactivé.');
          break;

        case 'channel':
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].suggestions.channel = channel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal des suggestions a été défini sur ${channel.name}`);
          break;

        case 'log':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].suggestions.logChannel = logChannel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de logs a été défini sur ${logChannel.name}`);
          break;

        case 'minlength':
          const minLength = parseInt(value);
          if (isNaN(minLength) || minLength < 1) {
            return message.reply('La longueur minimale doit être un nombre supérieur à 0.');
          }
          config[message.guild.id].suggestions.minLength = minLength;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La longueur minimale a été définie sur ${minLength} caractères`);
          break;

        case 'maxlength':
          const maxLength = parseInt(value);
          if (isNaN(maxLength) || maxLength < config[message.guild.id].suggestions.minLength) {
            return message.reply(`La longueur maximale doit être un nombre supérieur à ${config[message.guild.id].suggestions.minLength}.`);
          }
          config[message.guild.id].suggestions.maxLength = maxLength;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La longueur maximale a été définie sur ${maxLength} caractères`);
          break;

        case 'approval':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'approbation.');
          }
          config[message.guild.id].suggestions.requireApproval = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'approbation a été ${value.toLowerCase() === 'on' ? 'activée' : 'désactivée'}`);
          break;

        case 'attachments':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour autoriser/interdire les pièces jointes.');
          }
          config[message.guild.id].suggestions.allowAttachments = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Les pièces jointes ont été ${value.toLowerCase() === 'on' ? 'autorisées' : 'interdites'}`);
          break;

        case 'links':
          if (!['on', 'off'].includes(value.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour autoriser/interdire les liens.');
          }
          config[message.guild.id].suggestions.allowLinks = value.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Les liens ont été ${value.toLowerCase() === 'on' ? 'autorisés' : 'interdits'}`);
          break;

        case 'cooldown':
          const cooldown = parseInt(value);
          if (isNaN(cooldown) || cooldown < 1) {
            return message.reply('Le délai doit être un nombre de minutes supérieur à 0.');
          }
          config[message.guild.id].suggestions.cooldown = cooldown * 60; // Convertir en secondes
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le délai entre les suggestions a été défini sur ${cooldown} minutes`);
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des suggestions:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
