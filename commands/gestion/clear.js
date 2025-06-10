module.exports = {
  name: 'clear',
  description: 'Supprimer un nombre spécifié de messages',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ManageMessages')) {
      return message.reply('Vous devez avoir la permission de gérer les messages pour utiliser cette commande.');
    }

    const amount = parseInt(args[0]);

    if (isNaN(amount)) {
      return message.reply('Veuillez spécifier un nombre valide de messages à supprimer.');
    }

    if (amount < 1 || amount > 100) {
      return message.reply('Veuillez spécifier un nombre entre 1 et 100.');
    }

    try {
      // Supprimer le message de commande
      await message.delete();

      // Supprimer les messages
      const deleted = await message.channel.bulkDelete(amount, true);

      // Envoyer un message de confirmation
      const confirmMessage = await message.channel.send(`✅ ${deleted.size} message(s) ont été supprimés.`);
      
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
            title: '🗑️ Messages supprimés',
            fields: [
              {
                name: '📝 Nombre',
                value: `${deleted.size} messages`,
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: message.author.tag,
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