module.exports = {
  name: 'sync',
  description: 'Synchronise les permissions des salons avec leur catégorie',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply('Vous n\'avez pas la permission de gérer les salons.');
    }

    const channel = message.mentions.channels.first() || message.channel;
    if (!channel.parent) {
      return message.reply('Ce salon n\'appartient à aucune catégorie.');
    }

    try {
      await channel.lockPermissions();
      
      const embed = {
        title: '🔄 Permissions synchronisées',
        fields: [
          {
            name: '📝 Salon',
            value: channel.toString(),
            inline: true
          },
          {
            name: '📁 Catégorie',
            value: channel.parent.name,
            inline: true
          },
          {
            name: '👮 Modérateur',
            value: message.author.tag,
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation des permissions:', error);
      message.reply('Une erreur est survenue lors de la synchronisation des permissions.');
    }
  }
}; 