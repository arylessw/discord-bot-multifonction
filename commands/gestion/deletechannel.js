module.exports = {
  name: 'deletechannel',
  description: 'Supprimer un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const channel = message.mentions.channels.first();
    if (!channel) {
      return message.reply('Veuillez mentionner un salon à supprimer.');
    }

    try {
      // Sauvegarder les informations du salon avant la suppression
      const channelInfo = {
        name: channel.name,
        type: channel.type,
        id: channel.id,
        position: channel.position,
        parent: channel.parent?.name
      };

      // Demander confirmation
      const confirmMessage = await message.reply(
        `⚠️ Êtes-vous sûr de vouloir supprimer le salon ${channel} ?\n` +
        'Cette action est irréversible.\n' +
        'Répondez avec "oui" pour confirmer.'
      );

      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
        max: 1,
        time: 30000,
        errors: ['time']
      });

      // Supprimer le salon
      await channel.delete(`Supprimé par ${message.author.tag}`);

      // Envoyer un message de confirmation
      message.reply(`✅ Le salon ${channelInfo.name} a été supprimé avec succès.`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '🗑️ Salon supprimé',
            fields: [
              {
                name: '📌 Nom',
                value: channelInfo.name,
                inline: true
              },
              {
                name: '📝 Type',
                value: channelInfo.type,
                inline: true
              },
              {
                name: '📂 Catégorie',
                value: channelInfo.parent || 'Aucune',
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
        console.error('Erreur lors de la suppression du salon:', error);
        message.reply('❌ Une erreur est survenue lors de la suppression du salon.');
      }
    }
  }
}; 