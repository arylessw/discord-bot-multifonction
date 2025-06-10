const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'tempvoccmd',
  description: 'Configurer les salons vocaux temporaires',
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
          tempvoc: {
            enabled: false,
            category: null,
            name: '🎮 | {user}',
            userLimit: 0,
            bitrate: 96000,
            permissions: {
              everyone: {
                connect: true,
                speak: true,
                stream: true,
                useVAD: true,
                prioritySpeaker: false,
                muteMembers: false,
                deafenMembers: false,
                moveMembers: false
              },
              owner: {
                connect: true,
                speak: true,
                stream: true,
                useVAD: true,
                prioritySpeaker: true,
                muteMembers: true,
                deafenMembers: true,
                moveMembers: true
              }
            },
            roles: []
          }
        };
      }

      if (!config[message.guild.id].tempvoc) {
        config[message.guild.id].tempvoc = {
          enabled: false,
          category: null,
          name: '🎮 | {user}',
          userLimit: 0,
          bitrate: 96000,
          permissions: {
            everyone: {
              connect: true,
              speak: true,
              stream: true,
              useVAD: true,
              prioritySpeaker: false,
              muteMembers: false,
              deafenMembers: false,
              moveMembers: false
            },
            owner: {
              connect: true,
              speak: true,
              stream: true,
              useVAD: true,
              prioritySpeaker: true,
              muteMembers: true,
              deafenMembers: true,
              moveMembers: true
            }
          },
          roles: []
        };
      }

      if (!args[0]) {
        const currentCategory = config[message.guild.id].tempvoc.category 
          ? `<#${config[message.guild.id].tempvoc.category}>` 
          : 'Non configuré';

        return message.reply(
          'Configuration actuelle des salons vocaux temporaires:\n' +
          `Activé: ${config[message.guild.id].tempvoc.enabled ? '✅' : '❌'}\n` +
          `Catégorie: ${currentCategory}\n` +
          `Nom: ${config[message.guild.id].tempvoc.name}\n` +
          `Limite d'utilisateurs: ${config[message.guild.id].tempvoc.userLimit || 'Illimitée'}\n` +
          `Bitrate: ${config[message.guild.id].tempvoc.bitrate / 1000}kbps\n` +
          `Rôles autorisés: ${config[message.guild.id].tempvoc.roles.length > 0 ? config[message.guild.id].tempvoc.roles.map(r => `<@&${r}>`).join(', ') : 'Aucun'}\n\n` +
          'Variables disponibles:\n' +
          '`{user}` - Nom de l\'utilisateur\n' +
          '`{username}` - Nom d\'utilisateur\n' +
          '`{count}` - Nombre d\'utilisateurs\n\n' +
          'Commandes disponibles:\n' +
          '`tempvoccmd enable` - Activer les salons temporaires\n' +
          '`tempvoccmd disable` - Désactiver les salons temporaires\n' +
          '`tempvoccmd category #catégorie` - Définir la catégorie\n' +
          '`tempvoccmd name <nom>` - Définir le format du nom\n' +
          '`tempvoccmd limit <nombre>` - Définir la limite d\'utilisateurs\n' +
          '`tempvoccmd bitrate <nombre>` - Définir le bitrate (en kbps)\n' +
          '`tempvoccmd addrole @rôle` - Ajouter un rôle autorisé\n' +
          '`tempvoccmd removerole @rôle` - Retirer un rôle autorisé\n' +
          '`tempvoccmd listroles` - Lister les rôles autorisés\n' +
          '`tempvoccmd everyone <permission> on/off` - Configurer les permissions @everyone\n' +
          '`tempvoccmd owner <permission> on/off` - Configurer les permissions du propriétaire'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'enable':
          config[message.guild.id].tempvoc.enabled = true;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les salons vocaux temporaires ont été activés.');
          break;

        case 'disable':
          config[message.guild.id].tempvoc.enabled = false;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Les salons vocaux temporaires ont été désactivés.');
          break;

        case 'category':
          const category = message.mentions.channels.first();
          if (!category || category.type !== 'GUILD_CATEGORY') {
            return message.reply('Veuillez mentionner une catégorie valide.');
          }
          config[message.guild.id].tempvoc.category = category.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La catégorie des salons temporaires a été définie sur ${category.name}`);
          break;

        case 'name':
          if (!value) {
            return message.reply('Veuillez spécifier un format de nom.');
          }
          config[message.guild.id].tempvoc.name = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le format du nom des salons a été mis à jour.');
          break;

        case 'limit':
          const limit = parseInt(value);
          if (isNaN(limit) || limit < 0 || limit > 99) {
            return message.reply('Veuillez spécifier une limite valide entre 0 et 99.');
          }
          config[message.guild.id].tempvoc.userLimit = limit;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La limite d'utilisateurs a été définie sur ${limit || 'Illimitée'}`);
          break;

        case 'bitrate':
          const bitrate = parseInt(value);
          if (isNaN(bitrate) || bitrate < 8 || bitrate > 384) {
            return message.reply('Veuillez spécifier un bitrate valide entre 8 et 384 kbps.');
          }
          config[message.guild.id].tempvoc.bitrate = bitrate * 1000;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le bitrate a été défini sur ${bitrate}kbps`);
          break;

        case 'addrole':
          const roleToAdd = message.mentions.roles.first();
          if (!roleToAdd) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          if (config[message.guild.id].tempvoc.roles.includes(roleToAdd.id)) {
            return message.reply('Ce rôle est déjà autorisé.');
          }
          config[message.guild.id].tempvoc.roles.push(roleToAdd.id);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle ${roleToAdd.name} a été ajouté à la liste des rôles autorisés.`);
          break;

        case 'removerole':
          const roleToRemove = message.mentions.roles.first();
          if (!roleToRemove) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          if (!config[message.guild.id].tempvoc.roles.includes(roleToRemove.id)) {
            return message.reply('Ce rôle n\'est pas dans la liste des rôles autorisés.');
          }
          config[message.guild.id].tempvoc.roles = config[message.guild.id].tempvoc.roles.filter(r => r !== roleToRemove.id);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rôle ${roleToRemove.name} a été retiré de la liste des rôles autorisés.`);
          break;

        case 'listroles':
          if (config[message.guild.id].tempvoc.roles.length === 0) {
            return message.reply('Aucun rôle n\'est autorisé.');
          }
          message.reply(`Rôles autorisés:\n${config[message.guild.id].tempvoc.roles.map(r => `<@&${r}>`).join('\n')}`);
          break;

        case 'everyone':
        case 'owner':
          const [permission, state] = value.split(' ');
          if (!permission || !['connect', 'speak', 'stream', 'useVAD', 'prioritySpeaker', 'muteMembers', 'deafenMembers', 'moveMembers'].includes(permission)) {
            return message.reply('Permission invalide. Utilisez: connect, speak, stream, useVAD, prioritySpeaker, muteMembers, deafenMembers, moveMembers');
          }
          if (!['on', 'off'].includes(state.toLowerCase())) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver la permission.');
          }
          config[message.guild.id].tempvoc.permissions[subCommand][permission] = state.toLowerCase() === 'on';
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La permission ${permission} pour ${subCommand === 'everyone' ? '@everyone' : 'le propriétaire'} a été ${state.toLowerCase() === 'on' ? 'activée' : 'désactivée'}`);
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des salons vocaux temporaires:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
