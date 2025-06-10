module.exports = {
  name: 'lockall',
  description: 'Verrouiller/déverrouiller tous les salons',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    try {
      // Vérifier si les salons sont déjà verrouillés
      const everyoneRole = message.guild.roles.everyone;
      const textChannels = message.guild.channels.cache.filter(c => c.type === 'GUILD_TEXT');
      const firstChannel = textChannels.first();
      const permissions = firstChannel?.permissionOverwrites.cache.get(everyoneRole.id);
      const isLocked = permissions?.deny.has('SEND_MESSAGES');

      // Demander confirmation
      const confirmMessage = await message.reply(
        `⚠️ Êtes-vous sûr de vouloir ${isLocked ? 'déverrouiller' : 'verrouiller'} tous les salons textuels ?\n` +
        'Cette action affectera tous les salons textuels du serveur.\n' +
        'Répondez avec "oui" pour confirmer.'
      );

      const collected = await message.channel.awaitMessages({
        filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
        max: 1,
        time: 30000,
        errors: ['time']
      });

      // Supprimer les messages de confirmation
      await confirmMessage.delete().catch(console.error);
      await collected.first().delete().catch(console.error);

      let successCount = 0;
      let failCount = 0;

      // Verrouiller/déverrouiller chaque salon
      for (const channel of textChannels.values()) {
        try {
          await channel.permissionOverwrites.edit(everyoneRole, {
            SEND_MESSAGES: isLocked ? null : false
          }, `${isLocked ? 'Déverrouillé' : 'Verrouillé'} par ${message.author.tag}`);
          successCount++;
        } catch (error) {
          console.error(`Erreur lors de la modification du salon ${channel.name}:`, error);
          failCount++;
        }
      }

      // Envoyer un message de confirmation
      message.reply(
        `✅ Opération terminée !\n` +
        `- ${successCount} salon(x) ${isLocked ? 'déverrouillé(s)' : 'verrouillé(s)'} avec succès\n` +
        `- ${failCount} échec(s)`
      );

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: isLocked ? '🔓 Tous les salons déverrouillés' : '🔒 Tous les salons verrouillés',
            fields: [
              {
                name: '📝 Salons modifiés',
                value: `${successCount} salon(x)`,
                inline: true
              },
              {
                name: '❌ Échecs',
                value: `${failCount} salon(x)`,
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: isLocked ? 0x00ff00 : 0xff0000,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      if (error.name === 'TimeoutError') {
        message.reply('❌ Temps écoulé. Opération annulée.');
      } else {
        console.error('Erreur lors de l\'opération:', error);
        message.reply('❌ Une erreur est survenue lors de l\'opération.');
      }
    }
  }
}; 