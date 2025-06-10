module.exports = {
  name: 'clearuser',
  description: 'Supprimer les messages d\'un utilisateur spécifique',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply('Vous devez avoir la permission de gérer les messages pour utiliser cette commande.');
    }

    const user = message.mentions.users.first();
    if (!user) {
      return message.reply('Veuillez mentionner un utilisateur.');
    }

    const amount = parseInt(args[1]) || 100;

    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('Veuillez spécifier un nombre entre 1 et 100.');
    }

    try {
      // Supprimer le message de commande
      await message.delete();

      // Récupérer et supprimer les messages
      const messages = await message.channel.messages.fetch({ limit: 100 });
      const userMessages = messages.filter(m => m.author.id === user.id).first(amount);

      if (userMessages.length === 0) {
        return message.channel.send('❌ Aucun message trouvé de cet utilisateur dans les 100 derniers messages.');
      }

      await message.channel.bulkDelete(userMessages, true);

      // Envoyer un message de confirmation
      const confirmMessage = await message.channel.send(
        `✅ ${userMessages.length} message(s) de ${user.tag} ont été supprimés.`
      );

      // Supprimer le message de confirmation après 5 secondes
      setTimeout(() => {
        confirmMessage.delete().catch(console.error);
      }, 5000);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '🗑️ Messages utilisateur supprimés',
            fields: [
              {
                name: '📝 Nombre',
                value: `${userMessages.length} messages`,
                inline: true
              },
              {
                name: '👤 Utilisateur',
                value: user.toString(),
                inline: true
              },
              {
                name: '📌 Canal',
                value: message.channel.toString(),
                inline: true
              },
              {
                name: '👮 Modérateur',
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
      console.error('Erreur lors de la suppression des messages:', error);
      message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
    }
  }
}; 