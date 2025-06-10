module.exports = {
  name: 'nuke',
  description: 'Supprimer et recréer un salon',
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
      // Sauvegarder les informations du salon
      const channelInfo = {
        name: channel.name,
        type: channel.type,
        position: channel.position,
        parent: channel.parent,
        topic: channel.topic,
        nsfw: channel.nsfw,
        rateLimitPerUser: channel.rateLimitPerUser,
        permissionOverwrites: channel.permissionOverwrites.cache
      };

      // Demander confirmation
      const confirmMessage = await message.reply(
        `⚠️ Êtes-vous sûr de vouloir supprimer et recréer le salon ${channel} ?\n` +
        'Cette action supprimera tous les messages et recréera le salon.\n' +
        'Répondez avec "oui" pour confirmer.'
      );

      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
        max: 1,
        time: 30000,
        errors: ['time']
      });

      // Supprimer le salon
      await channel.delete(`Nuké par ${message.author.tag}`);

      // Recréer le salon
      const newChannel = await message.guild.channels.create(channelInfo.name, {
        type: channelInfo.type,
        position: channelInfo.position,
        parent: channelInfo.parent,
        topic: channelInfo.topic,
        nsfw: channelInfo.nsfw,
        rateLimitPerUser: channelInfo.rateLimitPerUser,
        permissionOverwrites: channelInfo.permissionOverwrites,
        reason: `Recréé par ${message.author.tag}`
      });

      // Envoyer un message de confirmation
      newChannel.send(`✅ Le salon a été nuké avec succès par ${message.author}`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '💥 Salon nuké',
            fields: [
              {
                name: '📌 Salon',
                value: newChannel.toString(),
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0xff0000,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        message.reply('❌ Temps écoulé. Opération annulée.');
      } else {
        console.error('Erreur lors du nuke du salon:', error);
        message.reply('❌ Une erreur est survenue lors de l\'opération.');
      }
    }
  }
}; 