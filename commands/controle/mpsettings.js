const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'mpsettings',
  description: 'Gérer les paramètres des messages privés',
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
          mpSettings: {
            autoReply: false,
            autoReplyMessage: 'Je ne suis pas disponible pour le moment. Je vous répondrai dès que possible.',
            cooldown: 60,
            maxMessages: 10,
            blacklist: [],
            whitelist: [],
            embed: {
              color: '#00ff00',
              title: 'Paramètres des messages privés',
              footer: 'Système de messages privés'
            }
          }
        };
      }

      if (!config[message.guild.id].mpSettings) {
        config[message.guild.id].mpSettings = {
          autoReply: false,
          autoReplyMessage: 'Je ne suis pas disponible pour le moment. Je vous répondrai dès que possible.',
          cooldown: 60,
          maxMessages: 10,
          blacklist: [],
          whitelist: [],
          embed: {
            color: '#00ff00',
            title: 'Paramètres des messages privés',
            footer: 'Système de messages privés'
          }
        };
      }

      if (!args[0]) {
        const blacklist = config[message.guild.id].mpSettings.blacklist
          .map(id => `<@${id}>`)
          .join(', ') || 'Aucun utilisateur';
        const whitelist = config[message.guild.id].mpSettings.whitelist
          .map(id => `<@${id}>`)
          .join(', ') || 'Aucun utilisateur';

        return message.reply(
          'Configuration actuelle des paramètres des messages privés:\n' +
          `Réponse automatique: ${config[message.guild.id].mpSettings.autoReply ? '✅' : '❌'}\n` +
          `Message de réponse automatique: ${config[message.guild.id].mpSettings.autoReplyMessage}\n` +
          `Délai entre les messages: ${config[message.guild.id].mpSettings.cooldown} secondes\n` +
          `Nombre maximum de messages: ${config[message.guild.id].mpSettings.maxMessages}\n` +
          `Liste noire: ${blacklist}\n` +
          `Liste blanche: ${whitelist}\n` +
          `Couleur de l'embed: ${config[message.guild.id].mpSettings.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].mpSettings.embed.title}\n` +
          `Pied de page: ${config[message.guild.id].mpSettings.embed.footer}\n\n` +
          'Commandes disponibles:\n' +
          '`mpsettings autoreply enable` - Activer la réponse automatique\n' +
          '`mpsettings autoreply disable` - Désactiver la réponse automatique\n' +
          '`mpsettings autoreply message <message>` - Définir le message de réponse automatique\n' +
          '`mpsettings cooldown <secondes>` - Définir le délai entre les messages\n' +
          '`mpsettings maxmessages <nombre>` - Définir le nombre maximum de messages\n' +
          '`mpsettings blacklist add <@user>` - Ajouter un utilisateur à la liste noire\n' +
          '`mpsettings blacklist remove <@user>` - Retirer un utilisateur de la liste noire\n' +
          '`mpsettings whitelist add <@user>` - Ajouter un utilisateur à la liste blanche\n' +
          '`mpsettings whitelist remove <@user>` - Retirer un utilisateur de la liste blanche\n' +
          '`mpsettings color <couleur>` - Définir la couleur de l\'embed\n' +
          '`mpsettings title <titre>` - Définir le titre de l\'embed\n' +
          '`mpsettings footer <texte>` - Définir le pied de page'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'autoreply':
          if (!args[1]) {
            return message.reply('Veuillez spécifier une action (enable/disable/message).');
          }
          const action = args[1].toLowerCase();
          if (action === 'enable') {
            config[message.guild.id].mpSettings.autoReply = true;
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply('✅ La réponse automatique a été activée.');
          } else if (action === 'disable') {
            config[message.guild.id].mpSettings.autoReply = false;
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply('✅ La réponse automatique a été désactivée.');
          } else if (action === 'message') {
            const message = args.slice(2).join(' ');
            if (!message) {
              return message.reply('Veuillez spécifier un message.');
            }
            config[message.guild.id].mpSettings.autoReplyMessage = message;
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply('✅ Le message de réponse automatique a été mis à jour.');
          } else {
            message.reply('Action invalide. Utilisez enable, disable ou message.');
          }
          break;

        case 'cooldown':
          const cooldown = parseInt(value);
          if (isNaN(cooldown) || cooldown < 0) {
            return message.reply('Veuillez spécifier un nombre de secondes valide.');
          }
          config[message.guild.id].mpSettings.cooldown = cooldown;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le délai entre les messages a été défini sur ${cooldown} secondes.`);
          break;

        case 'maxmessages':
          const maxMessages = parseInt(value);
          if (isNaN(maxMessages) || maxMessages < 1) {
            return message.reply('Veuillez spécifier un nombre valide (minimum 1).');
          }
          config[message.guild.id].mpSettings.maxMessages = maxMessages;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le nombre maximum de messages a été défini sur ${maxMessages}.`);
          break;

        case 'blacklist':
          if (!args[1]) {
            return message.reply('Veuillez spécifier une action (add/remove).');
          }
          const blacklistAction = args[1].toLowerCase();
          const blacklistUser = message.mentions.users.first();
          if (!blacklistUser) {
            return message.reply('Veuillez mentionner un utilisateur valide.');
          }
          if (blacklistAction === 'add') {
            if (config[message.guild.id].mpSettings.blacklist.includes(blacklistUser.id)) {
              return message.reply('Cet utilisateur est déjà dans la liste noire.');
            }
            config[message.guild.id].mpSettings.blacklist.push(blacklistUser.id);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${blacklistUser.tag} a été ajouté à la liste noire.`);
          } else if (blacklistAction === 'remove') {
            const index = config[message.guild.id].mpSettings.blacklist.indexOf(blacklistUser.id);
            if (index === -1) {
              return message.reply('Cet utilisateur n\'est pas dans la liste noire.');
            }
            config[message.guild.id].mpSettings.blacklist.splice(index, 1);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${blacklistUser.tag} a été retiré de la liste noire.`);
          } else {
            message.reply('Action invalide. Utilisez add ou remove.');
          }
          break;

        case 'whitelist':
          if (!args[1]) {
            return message.reply('Veuillez spécifier une action (add/remove).');
          }
          const whitelistAction = args[1].toLowerCase();
          const whitelistUser = message.mentions.users.first();
          if (!whitelistUser) {
            return message.reply('Veuillez mentionner un utilisateur valide.');
          }
          if (whitelistAction === 'add') {
            if (config[message.guild.id].mpSettings.whitelist.includes(whitelistUser.id)) {
              return message.reply('Cet utilisateur est déjà dans la liste blanche.');
            }
            config[message.guild.id].mpSettings.whitelist.push(whitelistUser.id);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${whitelistUser.tag} a été ajouté à la liste blanche.`);
          } else if (whitelistAction === 'remove') {
            const index = config[message.guild.id].mpSettings.whitelist.indexOf(whitelistUser.id);
            if (index === -1) {
              return message.reply('Cet utilisateur n\'est pas dans la liste blanche.');
            }
            config[message.guild.id].mpSettings.whitelist.splice(index, 1);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${whitelistUser.tag} a été retiré de la liste blanche.`);
          } else {
            message.reply('Action invalide. Utilisez add ou remove.');
          }
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #00ff00).');
          }
          config[message.guild.id].mpSettings.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].mpSettings.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].mpSettings.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des paramètres des messages privés:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
}; 