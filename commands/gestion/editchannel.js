module.exports = {
  name: 'editchannel',
  description: 'Modifier les paramètres d\'un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (!args[0]) {
      return message.reply(
        'Commandes disponibles:\n' +
        '`editchannel name <#channel> <nouveau_nom>` - Renommer un salon\n' +
        '`editchannel topic <#channel> <nouveau_sujet>` - Modifier le sujet d\'un salon\n' +
        '`editchannel nsfw <#channel> <on/off>` - Activer/désactiver le mode NSFW\n' +
        '`editchannel slowmode <#channel> <secondes>` - Définir le mode lent\n' +
        '`editchannel bitrate <#channel> <kbps>` - Définir le bitrate (salon vocal)\n' +
        '`editchannel userlimit <#channel> <nombre>` - Définir la limite d\'utilisateurs (salon vocal)'
      );
    }

    const subCommand = args[0].toLowerCase();
    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Veuillez mentionner un salon.');
    }

    try {
      switch (subCommand) {
        case 'name': {
          const newName = args.slice(2).join(' ');
          if (!newName) {
            return message.reply('Veuillez spécifier un nouveau nom.');
          }

          await channel.setName(newName, `Renommé par ${message.author.tag}`);
          message.reply(`✅ Le salon a été renommé en ${newName}`);
          break;
        }

        case 'topic': {
          const newTopic = args.slice(2).join(' ');
          if (!newTopic) {
            return message.reply('Veuillez spécifier un nouveau sujet.');
          }

          if (channel.type !== 'GUILD_TEXT') {
            return message.reply('Cette commande ne peut être utilisée que sur un salon textuel.');
          }

          await channel.setTopic(newTopic, `Sujet modifié par ${message.author.tag}`);
          message.reply(`✅ Le sujet du salon a été modifié.`);
          break;
        }

        case 'nsfw': {
          if (channel.type !== 'GUILD_TEXT') {
            return message.reply('Cette commande ne peut être utilisée que sur un salon textuel.');
          }

          const state = args[2]?.toLowerCase();
          if (!state || !['on', 'off'].includes(state)) {
            return message.reply('Veuillez spécifier "on" ou "off".');
          }

          await channel.setNSFW(state === 'on', `Mode NSFW ${state === 'on' ? 'activé' : 'désactivé'} par ${message.author.tag}`);
          message.reply(`✅ Le mode NSFW a été ${state === 'on' ? 'activé' : 'désactivé'}.`);
          break;
        }

        case 'slowmode': {
          if (channel.type !== 'GUILD_TEXT') {
            return message.reply('Cette commande ne peut être utilisée que sur un salon textuel.');
          }

          const seconds = parseInt(args[2]);
          if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
            return message.reply('Veuillez spécifier un nombre de secondes entre 0 et 21600.');
          }

          await channel.setRateLimitPerUser(seconds, `Mode lent modifié par ${message.author.tag}`);
          message.reply(`✅ Le mode lent a été défini à ${seconds} seconde(s).`);
          break;
        }

        case 'bitrate': {
          if (channel.type !== 'GUILD_VOICE') {
            return message.reply('Cette commande ne peut être utilisée que sur un salon vocal.');
          }

          const bitrate = parseInt(args[2]);
          if (isNaN(bitrate) || bitrate < 8 || bitrate > 384) {
            return message.reply('Veuillez spécifier un bitrate entre 8 et 384 kbps.');
          }

          await channel.setBitrate(bitrate * 1000, `Bitrate modifié par ${message.author.tag}`);
          message.reply(`✅ Le bitrate a été défini à ${bitrate} kbps.`);
          break;
        }

        case 'userlimit': {
          if (channel.type !== 'GUILD_VOICE') {
            return message.reply('Cette commande ne peut être utilisée que sur un salon vocal.');
          }

          const limit = parseInt(args[2]);
          if (isNaN(limit) || limit < 0 || limit > 99) {
            return message.reply('Veuillez spécifier une limite entre 0 et 99 utilisateurs.');
          }

          await channel.setUserLimit(limit, `Limite d\'utilisateurs modifiée par ${message.author.tag}`);
          message.reply(`✅ La limite d'utilisateurs a été définie à ${limit}.`);
          break;
        }

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '📝 Salon modifié',
            fields: [
              {
                name: '📌 Salon',
                value: channel.toString(),
                inline: true
              },
              {
                name: '📝 Modification',
                value: `${subCommand}: ${args.slice(2).join(' ')}`,
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0x00ff00,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la modification du salon:', error);
      message.reply('❌ Une erreur est survenue lors de la modification du salon.');
    }
  }
}; 