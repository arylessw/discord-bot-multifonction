const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'securinvite',
  description: 'Gérer les invitations sécurisées',
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
          secureInvites: {
            enabled: false,
            logChannel: null,
            whitelist: [],
            blacklist: [],
            maxUses: 0,
            maxAge: 0,
            embed: {
              color: '#00ff00',
              title: 'Invitation sécurisée',
              footer: 'Système d\'invitations sécurisées'
            }
          }
        };
      }

      if (!config[message.guild.id].secureInvites) {
        config[message.guild.id].secureInvites = {
          enabled: false,
          logChannel: null,
          whitelist: [],
          blacklist: [],
          maxUses: 0,
          maxAge: 0,
          embed: {
            color: '#00ff00',
            title: 'Invitation sécurisée',
            footer: 'Système d\'invitations sécurisées'
          }
        };
      }

      if (!args[0]) {
        const logChannel = config[message.guild.id].secureInvites.logChannel 
          ? `<#${config[message.guild.id].secureInvites.logChannel}>` 
          : 'Non configuré';
        const whitelist = config[message.guild.id].secureInvites.whitelist
          .map(id => `<@${id}>`)
          .join(', ') || 'Aucun utilisateur';
        const blacklist = config[message.guild.id].secureInvites.blacklist
          .map(id => `<@${id}>`)
          .join(', ') || 'Aucun utilisateur';

        return message.reply(
          'Configuration actuelle des invitations sécurisées:\n' +
          `Activé: ${config[message.guild.id].secureInvites.enabled ? '✅' : '❌'}\n` +
          `Canal de logs: ${logChannel}\n` +
          `Liste blanche: ${whitelist}\n` +
          `Liste noire: ${blacklist}\n` +
          `Utilisations maximum: ${config[message.guild.id].secureInvites.maxUses || 'Illimité'}\n` +
          `Durée maximum: ${config[message.guild.id].secureInvites.maxAge ? config[message.guild.id].secureInvites.maxAge + ' secondes' : 'Illimitée'}\n` +
          `Couleur de l'embed: ${config[message.guild.id].secureInvites.embed.color}\n` +
          `Titre de l'embed: ${config[message.guild.id].secureInvites.embed.title}\n` +
          `Pied de page: ${config[message.guild.id].secureInvites.embed.footer}\n\n` +
          'Commandes disponibles:\n' +
          '`securinvite enable` - Activer les invitations sécurisées\n' +
          '`securinvite disable` - Désactiver les invitations sécurisées\n' +
          '`securinvite logchannel <#channel>` - Définir le canal de logs\n' +
          '`securinvite whitelist add <@user>` - Ajouter un utilisateur à la liste blanche\n' +
          '`securinvite whitelist remove <@user>` - Retirer un utilisateur de la liste blanche\n' +
          '`securinvite blacklist add <@user>` - Ajouter un utilisateur à la liste noire\n' +
          '`securinvite blacklist remove <@user>` - Retirer un utilisateur de la liste noire\n' +
          '`securinvite maxuses <nombre>` - Définir le nombre maximum d\'utilisations\n' +
          '`securinvite maxage <secondes>` - Définir la durée maximum\n' +
          '`securinvite color <couleur>` - Définir la couleur de l\'embed\n' +
          '`securinvite title <titre>` - Définir le titre de l\'embed\n' +
          '`securinvite footer <texte>` - Définir le pied de page'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].secureInvites.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les invitations sécurisées ont été activées.');
          break;

        case 'disable':
          config[message.guild.id].secureInvites.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les invitations sécurisées ont été désactivées.');
          break;

        case 'logchannel':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].secureInvites.logChannel = logChannel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de logs a été défini sur ${logChannel.name}`);
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
            if (config[message.guild.id].secureInvites.whitelist.includes(whitelistUser.id)) {
              return message.reply('Cet utilisateur est déjà dans la liste blanche.');
            }
            config[message.guild.id].secureInvites.whitelist.push(whitelistUser.id);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${whitelistUser.tag} a été ajouté à la liste blanche.`);
          } else if (whitelistAction === 'remove') {
            const index = config[message.guild.id].secureInvites.whitelist.indexOf(whitelistUser.id);
            if (index === -1) {
              return message.reply('Cet utilisateur n\'est pas dans la liste blanche.');
            }
            config[message.guild.id].secureInvites.whitelist.splice(index, 1);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${whitelistUser.tag} a été retiré de la liste blanche.`);
          } else {
            message.reply('Action invalide. Utilisez add ou remove.');
          }
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
            if (config[message.guild.id].secureInvites.blacklist.includes(blacklistUser.id)) {
              return message.reply('Cet utilisateur est déjà dans la liste noire.');
            }
            config[message.guild.id].secureInvites.blacklist.push(blacklistUser.id);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${blacklistUser.tag} a été ajouté à la liste noire.`);
          } else if (blacklistAction === 'remove') {
            const index = config[message.guild.id].secureInvites.blacklist.indexOf(blacklistUser.id);
            if (index === -1) {
              return message.reply('Cet utilisateur n\'est pas dans la liste noire.');
            }
            config[message.guild.id].secureInvites.blacklist.splice(index, 1);
            fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
            message.reply(`✅ ${blacklistUser.tag} a été retiré de la liste noire.`);
          } else {
            message.reply('Action invalide. Utilisez add ou remove.');
          }
          break;

        case 'maxuses':
          const maxUses = parseInt(value);
          if (isNaN(maxUses) || maxUses < 0) {
            return message.reply('Veuillez spécifier un nombre valide (0 pour illimité).');
          }
          config[message.guild.id].secureInvites.maxUses = maxUses;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le nombre maximum d'utilisations a été défini sur ${maxUses || 'illimité'}.`);
          break;

        case 'maxage':
          const maxAge = parseInt(value);
          if (isNaN(maxAge) || maxAge < 0) {
            return message.reply('Veuillez spécifier un nombre de secondes valide (0 pour illimité).');
          }
          config[message.guild.id].secureInvites.maxAge = maxAge;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La durée maximum a été définie sur ${maxAge || 'illimitée'} secondes.`);
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #00ff00).');
          }
          config[message.guild.id].secureInvites.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].secureInvites.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].secureInvites.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des invitations sécurisées:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
