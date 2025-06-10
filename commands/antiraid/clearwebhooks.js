module.exports = {
  name: 'clearwebhooks',
  description: 'Supprime tous les webhooks du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Cette commande doit être utilisée dans un serveur.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission d\'administrateur pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Récupérer tous les canaux du serveur
      const channels = message.guild.channels.cache.filter(channel => channel.type === 0); // 0 = GUILD_TEXT
      let totalWebhooks = 0;
      let deletedWebhooks = 0;

      // Message de chargement
      const loadingMsg = await message.reply({
        embeds: [{
          title: '🔄 Suppression des webhooks',
          description: 'Recherche et suppression des webhooks en cours...',
          color: 0x3498db,
          timestamp: new Date()
        }]
      });

      // Parcourir tous les canaux
      for (const channel of channels.values()) {
        try {
          const webhooks = await channel.fetchWebhooks();
          totalWebhooks += webhooks.size;

          // Supprimer chaque webhook
          for (const webhook of webhooks.values()) {
            try {
              await webhook.delete();
              deletedWebhooks++;
            } catch (error) {
              console.error(`Erreur lors de la suppression du webhook ${webhook.id}:`, error);
            }
          }
        } catch (error) {
          console.error(`Erreur lors de la récupération des webhooks du canal ${channel.name}:`, error);
        }
      }

      // Message de résultat
      loadingMsg.edit({
        embeds: [{
          title: '✅ Webhooks supprimés',
          description: `La suppression des webhooks est terminée.`,
          color: 0x00ff00,
          fields: [
            {
              name: '📊 Statistiques',
              value: `Total trouvé : ${totalWebhooks}\nSupprimés : ${deletedWebhooks}`,
              inline: true
            },
            {
              name: '👮 Modérateur',
              value: message.author.tag,
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      const serverConfig = config[message.guild.id] || {};
      if (serverConfig.logChannel) {
        const logChannel = message.guild.channels.cache.get(serverConfig.logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🧹 Webhooks supprimés',
            description: `Tous les webhooks ont été supprimés par ${message.author.tag}`,
            color: 0x00ff00,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '📊 Statistiques',
                value: `Total trouvé : ${totalWebhooks}\nSupprimés : ${deletedWebhooks}`,
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur clearwebhooks:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la suppression des webhooks.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 