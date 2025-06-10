module.exports = {
  name: 'clear',
  description: 'Supprime un nombre spécifié de messages',
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

    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission de gérer les messages pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.guild.members.me.permissions.has('ManageMessages')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Je n\'ai pas la permission de gérer les messages.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply({
        embeds: [{
          title: '❌ Nombre invalide',
          description: 'Veuillez spécifier un nombre entre 1 et 100.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Supprimer le message de commande
      await message.delete().catch(console.error);

      // Récupérer et supprimer les messages
      const messages = await message.channel.messages.fetch({ limit: amount });
      await message.channel.bulkDelete(messages);

      // Envoyer un message de confirmation
      const confirmationMessage = await message.channel.send({
        embeds: [{
          title: '🗑️ Messages supprimés',
          description: `${messages.size} messages ont été supprimés.`,
          color: 0xffa500,
          fields: [
            {
              name: '👤 Modérateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: '📝 Canal',
              value: message.channel.toString(),
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });

      // Supprimer le message de confirmation après 5 secondes
      setTimeout(() => {
        confirmationMessage.delete().catch(console.error);
      }, 5000);

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '🗑️ Messages supprimés',
              description: `${messages.size} messages ont été supprimés dans ${message.channel}.`,
              color: 0xffa500,
              fields: [
                {
                  name: '👤 Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '📝 Canal',
                  value: message.channel.toString(),
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur clear:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la suppression des messages.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
};
