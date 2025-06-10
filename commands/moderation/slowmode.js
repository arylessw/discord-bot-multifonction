module.exports = {
  name: 'slowmode',
  description: 'Configure le mode lent d\'un canal',
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

    const duration = args[0];
    if (!duration) {
      return message.reply({
        embeds: [{
          title: '❌ Durée non spécifiée',
          description: 'Veuillez spécifier une durée (ex: 1s, 1m, 1h).',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const durationRegex = /^(\d+)([smh])$/;
    const match = duration.match(durationRegex);
    if (!match) {
      return message.reply({
        embeds: [{
          title: '❌ Format de durée invalide',
          description: 'Le format de la durée doit être : nombre + unité (s = secondes, m = minutes, h = heures).',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const [, amount, unit] = match;
    let seconds;
    switch (unit) {
      case 's':
        seconds = parseInt(amount);
        break;
      case 'm':
        seconds = parseInt(amount) * 60;
        break;
      case 'h':
        seconds = parseInt(amount) * 60 * 60;
        break;
    }

    if (seconds < 0 || seconds > 21600) {
      return message.reply({
        embeds: [{
          title: '❌ Durée invalide',
          description: 'La durée doit être comprise entre 0 et 6 heures.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Configurer le mode lent
      await message.channel.setRateLimitPerUser(seconds);

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: seconds === 0 ? '✅ Mode lent désactivé' : '⏱️ Mode lent configuré',
          description: `Le mode lent a été ${seconds === 0 ? 'désactivé' : 'configuré'} dans ce canal.`,
          color: seconds === 0 ? 0x00ff00 : 0xffa500,
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
            },
            {
              name: '⏱️ Durée',
              value: seconds === 0 ? 'Désactivé' : duration,
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
              title: seconds === 0 ? '✅ Mode lent désactivé' : '⏱️ Mode lent configuré',
              description: `Le mode lent a été ${seconds === 0 ? 'désactivé' : 'configuré'} dans ${message.channel}.`,
              color: seconds === 0 ? 0x00ff00 : 0xffa500,
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
                },
                {
                  name: '⏱️ Durée',
                  value: seconds === 0 ? 'Désactivé' : duration,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur slowmode:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration du mode lent.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 