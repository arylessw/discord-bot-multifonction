module.exports = {
  name: 'createchannel',
  description: 'Créer un nouveau salon',
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
        '`createchannel text <nom>` - Créer un salon textuel\n' +
        '`createchannel voice <nom>` - Créer un salon vocal\n' +
        '`createchannel category <nom>` - Créer une catégorie'
      );
    }

    const type = args[0].toLowerCase();
    const name = args.slice(1).join(' ');

    if (!name) {
      return message.reply('Veuillez spécifier un nom pour le salon.');
    }

    try {
      let newChannel;
      let channelType;

      switch (type) {
        case 'text': {
          newChannel = await message.guild.channels.create(name, {
            type: 'GUILD_TEXT',
            reason: `Créé par ${message.author.tag}`
          });
          channelType = 'textuel';
          break;
        }

        case 'voice': {
          newChannel = await message.guild.channels.create(name, {
            type: 'GUILD_VOICE',
            reason: `Créé par ${message.author.tag}`
          });
          channelType = 'vocal';
          break;
        }

        case 'category': {
          newChannel = await message.guild.channels.create(name, {
            type: 'GUILD_CATEGORY',
            reason: `Créé par ${message.author.tag}`
          });
          channelType = 'catégorie';
          break;
        }

        default:
          return message.reply('Type de salon invalide. Utilisez la commande sans arguments pour voir la liste des types disponibles.');
      }

      // Envoyer un message de confirmation
      message.reply(`✅ Le salon ${channelType} ${newChannel} a été créé avec succès.`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '📋 Salon créé',
            fields: [
              {
                name: '📌 Salon',
                value: newChannel.toString(),
                inline: true
              },
              {
                name: '📝 Type',
                value: channelType,
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
      console.error('Erreur lors de la création du salon:', error);
      message.reply('❌ Une erreur est survenue lors de la création du salon.');
    }
  }
}; 