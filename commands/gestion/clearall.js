module.exports = {
  name: 'clearall',
  description: 'Supprimer tous les messages d\'un canal',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    try {
      // Demander confirmation
      const confirmMessage = await message.reply(
        '⚠️ Êtes-vous sûr de vouloir supprimer tous les messages de ce canal ?\n' +
        'Cette action est irréversible.\n' +
        'Répondez avec "oui" pour confirmer.'
      );

      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
        max: 1,
        time: 30000,
        errors: ['time']
      });

      // Supprimer le message de confirmation
      await confirmMessage.delete().catch(console.error);
      await collected.first().delete().catch(console.error);

      // Supprimer les messages par lots de 100
      let deletedTotal = 0;
      let lastId;

      while (true) {
        const options = { limit: 100 };
        if (lastId) {
          options.before = lastId;
        }

        const messages = await message.channel.messages.fetch(options);
        if (messages.size === 0) break;

        lastId = messages.last().id;
        await message.channel.bulkDelete(messages, true);
        deletedTotal += messages.size;

        // Attendre 1 seconde pour éviter le rate limit
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      // Envoyer un message de confirmation
      const finalMessage = await message.channel.send(`✅ ${deletedTotal} message(s) ont été supprimés.`);
      
      // Supprimer le message de confirmation après 5 secondes
      setTimeout(() => {
        finalMessage.delete().catch(console.error);
      }, 5000);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '🗑️ Tous les messages supprimés',
            fields: [
              {
                name: '📝 Nombre',
                value: `${deletedTotal} messages`,
                inline: true
              },
              {
                name: '📌 Canal',
                value: message.channel.toString(),
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
        console.error('Erreur lors de la suppression des messages:', error);
        message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
      }
    }
  }
}; 