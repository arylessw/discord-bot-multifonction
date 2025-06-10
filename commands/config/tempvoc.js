const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'tempvoc',
  description: 'Gérer les salons vocaux temporaires',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const configDir = path.join(__dirname, '../../config');
    const configFile = path.join(configDir, 'server_config.json');

    try {
      // Charger la configuration
      if (!fs.existsSync(configFile)) {
        return message.reply('❌ Les salons vocaux temporaires ne sont pas configurés sur ce serveur.');
      }

      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      if (!config[message.guild.id] || !config[message.guild.id].tempvoc || !config[message.guild.id].tempvoc.enabled) {
        return message.reply('❌ Les salons vocaux temporaires ne sont pas activés sur ce serveur.');
      }

      const tempvocConfig = config[message.guild.id].tempvoc;

      // Vérifier si l'utilisateur a les permissions nécessaires
      const member = message.member;
      const hasPermission = member.permissions.has('Administrator') || 
                          tempvocConfig.roles.some(roleId => member.roles.cache.has(roleId));

      if (!hasPermission) {
        return message.reply('❌ Vous n\'avez pas la permission d\'utiliser les salons vocaux temporaires.');
      }

      if (!args[0]) {
        return message.reply(
          'Commandes disponibles:\n' +
          '`tempvoc create` - Créer un salon temporaire\n' +
          '`tempvoc limit <nombre>` - Définir la limite d\'utilisateurs\n' +
          '`tempvoc name <nom>` - Renommer le salon\n' +
          '`tempvoc lock` - Verrouiller le salon\n' +
          '`tempvoc unlock` - Déverrouiller le salon\n' +
          '`tempvoc hide` - Cacher le salon\n' +
          '`tempvoc show` - Afficher le salon\n' +
          '`tempvoc bitrate <nombre>` - Définir le bitrate (en kbps)\n' +
          '`tempvoc userlimit <nombre>` - Définir la limite d\'utilisateurs\n' +
          '`tempvoc delete` - Supprimer le salon'
        );
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      // Vérifier si l'utilisateur est dans un salon vocal
      const voiceChannel = member.voice.channel;
      if (!voiceChannel) {
        return message.reply('❌ Vous devez être dans un salon vocal pour utiliser cette commande.');
      }

      // Vérifier si le salon appartient à l'utilisateur
      const isOwner = voiceChannel.name.includes(member.user.username) || 
                     voiceChannel.name.includes(member.displayName);
      if (!isOwner && !member.permissions.has('Administrator')) {
        return message.reply('❌ Vous ne pouvez gérer que vos propres salons vocaux temporaires.');
      }

      switch (subCommand) {
        case 'create':
          if (voiceChannel) {
            return message.reply('❌ Vous êtes déjà dans un salon vocal.');
          }

          const category = message.guild.channels.cache.get(tempvocConfig.category);
          if (!category) {
            return message.reply('❌ La catégorie des salons temporaires n\'est pas configurée.');
          }

          const channelName = tempvocConfig.name
            .replace('{user}', member.displayName)
            .replace('{username}', member.user.username)
            .replace('{count}', '0');

          const newChannel = await message.guild.channels.create(channelName, {
            type: 'GUILD_VOICE',
            parent: category,
            userLimit: tempvocConfig.userLimit,
            bitrate: tempvocConfig.bitrate,
            permissionOverwrites: [
              {
                id: message.guild.id,
                allow: tempvocConfig.permissions.everyone
              },
              {
                id: member.id,
                allow: tempvocConfig.permissions.owner
              }
            ]
          });

          message.reply(`✅ Salon vocal temporaire créé: ${newChannel}`);
          break;

        case 'limit':
          const limit = parseInt(value);
          if (isNaN(limit) || limit < 0 || limit > 99) {
            return message.reply('❌ Veuillez spécifier une limite valide entre 0 et 99.');
          }
          await voiceChannel.setUserLimit(limit);
          message.reply(`✅ La limite d'utilisateurs a été définie sur ${limit || 'Illimitée'}`);
          break;

        case 'name':
          if (!value) {
            return message.reply('❌ Veuillez spécifier un nom.');
          }
          await voiceChannel.setName(value);
          message.reply(`✅ Le salon a été renommé en: ${value}`);
          break;

        case 'lock':
          await voiceChannel.permissionOverwrites.edit(message.guild.id, {
            CONNECT: false
          });
          message.reply('✅ Le salon a été verrouillé.');
          break;

        case 'unlock':
          await voiceChannel.permissionOverwrites.edit(message.guild.id, {
            CONNECT: true
          });
          message.reply('✅ Le salon a été déverrouillé.');
          break;

        case 'hide':
          await voiceChannel.permissionOverwrites.edit(message.guild.id, {
            VIEW_CHANNEL: false
          });
          message.reply('✅ Le salon a été caché.');
          break;

        case 'show':
          await voiceChannel.permissionOverwrites.edit(message.guild.id, {
            VIEW_CHANNEL: true
          });
          message.reply('✅ Le salon est maintenant visible.');
          break;

        case 'bitrate':
          const bitrate = parseInt(value);
          if (isNaN(bitrate) || bitrate < 8 || bitrate > 384) {
            return message.reply('❌ Veuillez spécifier un bitrate valide entre 8 et 384 kbps.');
          }
          await voiceChannel.setBitrate(bitrate * 1000);
          message.reply(`✅ Le bitrate a été défini sur ${bitrate}kbps`);
          break;

        case 'userlimit':
          const userLimit = parseInt(value);
          if (isNaN(userLimit) || userLimit < 0 || userLimit > 99) {
            return message.reply('❌ Veuillez spécifier une limite valide entre 0 et 99.');
          }
          await voiceChannel.setUserLimit(userLimit);
          message.reply(`✅ La limite d'utilisateurs a été définie sur ${userLimit || 'Illimitée'}`);
          break;

        case 'delete':
          await voiceChannel.delete();
          message.reply('✅ Le salon a été supprimé.');
          break;

        default:
          message.reply('❌ Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des salons vocaux temporaires:', error);
      message.reply('❌ Une erreur est survenue.');
    }
  }
};
