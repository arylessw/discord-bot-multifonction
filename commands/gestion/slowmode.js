const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'slowmode',
  description: 'Configurer le mode lent d\'un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (args.length === 0) {
      return message.reply(
        'Veuillez spécifier un délai en secondes (0 pour désactiver).\n' +
        'Utilisation: `!slowmode <secondes>`'
      );
    }

    const seconds = parseInt(args[0]);
    if (isNaN(seconds) || seconds < 0 || seconds > 21600) {
      return message.reply('Le délai doit être un nombre entre 0 et 21600 secondes (6 heures).');
    }

    try {
      await message.channel.setRateLimitPerUser(seconds, `Mode lent configuré par ${message.author.tag}`);

      if (seconds === 0) {
        message.reply('✅ Le mode lent a été désactivé.');
      } else {
        message.reply(`✅ Le mode lent a été configuré à ${seconds} seconde(s).`);
      }

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '⏱️ Mode lent configuré',
            fields: [
              {
                name: '📌 Canal',
                value: message.channel.toString(),
                inline: true
              },
              {
                name: '⏳ Délai',
                value: seconds === 0 ? 'Désactivé' : `${seconds} seconde(s)`,
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0x00ff00,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la configuration du mode lent:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration du mode lent.');
    }
  }
}; 