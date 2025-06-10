module.exports = {
  name: 'lock',
  description: 'Verrouille un canal',
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
      // Vérifier si le canal est déjà verrouillé
      if (message.channel.permissionsFor(message.guild.roles.everyone).has('SendMessages') === false) {
        return message.reply({
          embeds: [{
            title: '❌ Canal déjà verrouillé',
            description: 'Ce canal est déjà verrouillé.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Verrouiller le canal
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SendMessages: false
      });

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '🔒 Canal verrouillé',
          description: 'Ce canal a été verrouillé.',
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

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '🔒 Canal verrouillé',
              description: `${message.channel} a été verrouillé.`,
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
      console.error('Erreur lock:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors du verrouillage du canal.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 