module.exports = {
  name: 'lock',
  description: 'Verrouiller/déverrouiller un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const channel = message.mentions.channels.first() || message.channel;
    if (channel.type !== 'GUILD_TEXT') {
      return message.reply('Cette commande ne peut être utilisée que sur un salon textuel.');
    }

    try {
      // Vérifier si le salon est déjà verrouillé
      const everyoneRole = message.guild.roles.everyone;
      const permissions = channel.permissionOverwrites.cache.get(everyoneRole.id);
      const isLocked = permissions?.deny.has('SEND_MESSAGES');

      if (isLocked) {
        // Déverrouiller le salon
        await channel.permissionOverwrites.edit(everyoneRole, {
          SEND_MESSAGES: null
        }, `Déverrouillé par ${message.author.tag}`);

        message.reply(`✅ Le salon ${channel} a été déverrouillé.`);
      } else {
        // Verrouiller le salon
        await channel.permissionOverwrites.edit(everyoneRole, {
          SEND_MESSAGES: false
        }, `Verrouillé par ${message.author.tag}`);

        message.reply(`🔒 Le salon ${channel} a été verrouillé.`);
      }

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: isLocked ? '🔓 Salon déverrouillé' : '🔒 Salon verrouillé',
            fields: [
              {
                name: '📌 Salon',
                value: channel.toString(),
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: isLocked ? 0x00ff00 : 0xff0000,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors du verrouillage/déverrouillage du salon:', error);
      message.reply('❌ Une erreur est survenue lors de l\'opération.');
    }
  }
}; 