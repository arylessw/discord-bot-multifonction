const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'purge',
  description: 'Supprimer un nombre spécifié de messages',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const amount = parseInt(args[0]);
    if (isNaN(amount) || amount < 1 || amount > 100) {
      return message.reply('Veuillez spécifier un nombre entre 1 et 100.');
    }

    try {
      // Supprimer le message de commande
      await message.delete();

      // Supprimer les messages
      const messages = await message.channel.messages.fetch({ limit: amount });
      const deletedMessages = await message.channel.bulkDelete(messages, true);

      // Envoyer un message de confirmation
      const confirmMessage = await message.channel.send(
        `✅ ${deletedMessages.size} message(s) supprimé(s).`
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
          const logEmbed = {
            title: '🗑️ Messages supprimés',
            fields: [
              {
                name: '📌 Canal',
                value: message.channel.toString(),
                inline: true
              },
              {
                name: '📊 Nombre de messages',
                value: deletedMessages.size.toString(),
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
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des messages:', error);
      message.reply('❌ Une erreur est survenue lors de la suppression des messages.');
    }
  }
}; 