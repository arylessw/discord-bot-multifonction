const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autoupdate',
  description: 'Configurer les mises à jour automatiques du bot',
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
          autoupdate: {
            enabled: false,
            channel: null,
            notifyRoles: [],
            message: 'Une mise à jour est disponible !',
            embed: {
              color: '#00ff00',
              title: 'Mise à jour disponible',
              footer: 'Système de mise à jour automatique'
            }
          }
        };
      }

      if (!config[message.guild.id].autoupdate) {
        config[message.guild.id].autoupdate = {
          enabled: false,
          channel: null,
          notifyRoles: [],
          message: 'Une mise à jour est disponible !',
          embed: {
            color: '#00ff00',
            title: 'Mise à jour disponible',
            footer: 'Système de mise à jour automatique'
          }
        };
      }

      if (!args[0]) {
        const channel = config[message.guild.id].autoupdate.channel 
          ? `<#${config[message.guild.id].autoupdate.channel}>` 
          : 'Non configuré';
        const roles = config[message.guild.id].autoupdate.notifyRoles
          .map(r => `<@&${r}>`)
          .join(', ') || 'Aucun rôle configuré';

        return message.reply(
          'Configuration actuelle des mises à jour automatiques:\n' +
          `Activé: ${config[message.guild.id].autoupdate.enabled ? '✅' : '❌'}\n` +
          `Canal: ${channel}\n` +
          `Rôles notifiés: ${roles}\n` +
          `Message: ${config[message.guild.id].autoupdate.message}\n` +
          `Couleur de l'embed: ${config[message.guild.id].autoupdate.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].autoupdate.embed.title}\n` +
          `Pied de page: ${config[message.guild.id].autoupdate.embed.footer}\n\n` +
          'Commandes disponibles:\n' +
          '`autoupdate enable` - Activer les mises à jour automatiques\n' +
          '`autoupdate disable` - Désactiver les mises à jour automatiques\n' +
          '`autoupdate channel <#channel>` - Définir le canal de notification\n' +
          '`autoupdate addrole <@role>` - Ajouter un rôle à notifier\n' +
          '`autoupdate removerole <@role>` - Supprimer un rôle à notifier\n' +
          '`autoupdate message <message>` - Définir le message\n' +
          '`autoupdate color <couleur>` - Définir la couleur de l\'embed\n' +
          '`autoupdate title <titre>` - Définir le titre de l\'embed\n' +
          '`autoupdate footer <texte>` - Définir le pied de page'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].autoupdate.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les mises à jour automatiques ont été activées.');
          break;

        case 'disable':
          config[message.guild.id].autoupdate.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les mises à jour automatiques ont été désactivées.');
          break;

        case 'channel':
          const channel = message.mentions.channels.first();
          if (!channel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].autoupdate.channel = channel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de notification a été défini sur ${channel.name}`);
          break;

        case 'addrole':
          const roleToAdd = message.mentions.roles.first();
          if (!roleToAdd) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          if (config[message.guild.id].autoupdate.notifyRoles.includes(roleToAdd.id)) {
            return message.reply('Ce rôle est déjà dans la liste des rôles à notifier.');
          }
          config[message.guild.id].autoupdate.notifyRoles.push(roleToAdd.id);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle ${roleToAdd.name} a été ajouté à la liste des rôles à notifier.`);
          break;

        case 'removerole':
          const roleToRemove = message.mentions.roles.first();
          if (!roleToRemove) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          const index = config[message.guild.id].autoupdate.notifyRoles.indexOf(roleToRemove.id);
          if (index === -1) {
            return message.reply('Ce rôle n\'est pas dans la liste des rôles à notifier.');
          }
          config[message.guild.id].autoupdate.notifyRoles.splice(index, 1);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle ${roleToRemove.name} a été retiré de la liste des rôles à notifier.`);
          break;

        case 'message':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].autoupdate.message = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le message a été mis à jour.');
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #00ff00).');
          }
          config[message.guild.id].autoupdate.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].autoupdate.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].autoupdate.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des mises à jour automatiques:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
