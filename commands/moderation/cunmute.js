module.exports = {
  name: 'cunmute',
  description: 'Démet un utilisateur dans un canal spécifique',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('Vous devez avoir la permission de modérer les membres pour utiliser cette commande.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply('Veuillez mentionner un utilisateur ou fournir son ID.');
    }

    const channel = message.mentions.channels.first() || message.channel;
    if (!channel) {
      return message.reply('Canal invalide.');
    }

    try {
      // Vérifier si l'utilisateur est muté dans le canal
      const permissions = channel.permissionOverwrites.cache.get(target.id);
      if (!permissions || !permissions.deny.has('SendMessages')) {
        return message.reply(`${target.user.tag} n'est pas muté dans ce canal.`);
      }

      // Démet l'utilisateur
      await channel.permissionOverwrites.edit(target, {
        SendMessages: null
      });

      message.reply({
        embeds: [{
          title: '🔊 Utilisateur démuté',
          description: `${target.user.tag} a été démuté dans ${channel}.`,
          color: 0x00ff00,
          fields: [
            {
              name: 'Modérateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: 'Canal',
              value: channel.name,
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
              title: '🔊 Utilisateur démuté dans un canal',
              description: `${target.user.tag} a été démuté dans ${channel}.`,
              color: 0x00ff00,
              fields: [
                {
                  name: 'Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: 'Canal',
                  value: channel.name,
                  inline: true
                },
                {
                  name: 'Date',
                  value: new Date().toLocaleString(),
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur cunmute:', error);
      message.reply('Une erreur est survenue lors du démutage de l\'utilisateur.');
    }
  }
};
