module.exports = {
  name: 'nuke',
  description: 'Supprime tous les messages d\'un canal',
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

    if (!message.member.permissions.has('ManageChannels')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission de gérer les canaux pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.guild.members.me.permissions.has('ManageChannels')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Je n\'ai pas la permission de gérer les canaux.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Envoyer un message de confirmation
      const confirmationMessage = await message.reply({
        embeds: [{
          title: '⚠️ Confirmation requise',
          description: 'Êtes-vous sûr de vouloir supprimer tous les messages de ce canal ? Cette action est irréversible.',
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

      // Ajouter les réactions
      await confirmationMessage.react('✅');
      await confirmationMessage.react('❌');

      // Attendre la réaction
      const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
      const collected = await confirmationMessage.awaitReactions({ filter, max: 1, time: 30000, errors: ['time'] });

      // Vérifier la réaction
      const reaction = collected.first();
      if (reaction.emoji.name === '❌') {
        await confirmationMessage.edit({
          embeds: [{
            title: '❌ Action annulée',
            description: 'La suppression des messages a été annulée.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
        return;
      }

      // Supprimer le message de confirmation
      await confirmationMessage.delete().catch(console.error);

      // Cloner le canal
      const newChannel = await message.channel.clone();

      // Supprimer l'ancien canal
      await message.channel.delete();

      // Envoyer un message dans le nouveau canal
      newChannel.send({
        embeds: [{
          title: '💥 Canal réinitialisé',
          description: 'Ce canal a été réinitialisé.',
          color: 0xffa500,
          fields: [
            {
              name: '👤 Modérateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: '📝 Canal',
              value: newChannel.toString(),
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '💥 Canal réinitialisé',
              description: `${newChannel} a été réinitialisé.`,
              color: 0xffa500,
              fields: [
                {
                  name: '👤 Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '📝 Canal',
                  value: newChannel.toString(),
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur nuke:', error);
      if (error.name === 'TimeoutError') {
        message.reply({
          embeds: [{
            title: '❌ Temps écoulé',
            description: 'Vous n\'avez pas réagi à temps.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      } else {
        message.reply({
          embeds: [{
            title: '❌ Erreur',
            description: 'Une erreur est survenue lors de la réinitialisation du canal.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }
    }
  }
}; 