module.exports = {
  name: 'cleanup',
  description: 'Déconnecte tous les utilisateurs d\'un salon vocal',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const channel = message.mentions.channels.first() || message.member.voice.channel;
    if (!channel) {
      return message.reply('Veuillez mentionner un salon vocal ou être connecté à un salon vocal.');
    }

    if (channel.type !== 'GUILD_VOICE') {
      return message.reply('Cette commande ne peut être utilisée que sur un salon vocal.');
    }

    try {
      // Demander confirmation
      const confirmMessage = await message.reply(
        `⚠️ Êtes-vous sûr de vouloir déconnecter tous les utilisateurs du salon ${channel} ?\n` +
        'Cette action est irréversible.\n' +
        'Répondez avec "oui" pour confirmer.'
      );

      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
        max: 1,
        time: 30000,
        errors: ['time']
      });

      // Déconnecter tous les utilisateurs
      const members = channel.members;
      let successCount = 0;
      let failCount = 0;

      for (const [id, member] of members) {
        try {
          await member.voice.disconnect(`Déconnecté par ${message.author.tag}`);
          successCount++;
        } catch (error) {
          console.error(`Erreur lors de la déconnexion de ${member.user.tag}:`, error);
          failCount++;
        }
      }

      // Envoyer un message de confirmation
      message.reply(
        `✅ Nettoyage terminé !\n` +
        `- ${successCount} utilisateur(s) déconnecté(s) avec succès\n` +
        `- ${failCount} échec(s)`
      );

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '🎵 Salon vocal nettoyé',
            fields: [
              {
                name: '📌 Salon',
                value: channel.toString(),
                inline: true
              },
              {
                name: '✅ Déconnectés',
                value: `${successCount} utilisateur(s)`,
                inline: true
              },
              {
                name: '❌ Échecs',
                value: `${failCount} utilisateur(s)`,
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
        console.error('Erreur lors du nettoyage du salon vocal:', error);
        message.reply('❌ Une erreur est survenue lors de l\'opération.');
      }
    }
  }
}; 