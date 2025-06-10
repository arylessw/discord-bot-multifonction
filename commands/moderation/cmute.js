module.exports = {
  name: 'cmute',
  description: 'Met en sourdine un utilisateur dans un canal spécifique',
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

    // Vérifier si l'utilisateur est déjà muté dans le canal
    const permissions = channel.permissionOverwrites.cache.get(target.id);
    if (permissions && permissions.deny.has('SendMessages')) {
      return message.reply(`${target.user.tag} est déjà muté dans ce canal.`);
    }

    try {
      // Muter l'utilisateur dans le canal
      await channel.permissionOverwrites.edit(target, {
        SendMessages: false
      });

      message.reply({
        embeds: [{
          title: '🔇 Utilisateur muté',
          description: `${target.user.tag} a été muté dans ${channel}.`,
          color: 0xff0000,
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
              title: '🔇 Utilisateur muté dans un canal',
              description: `${target.user.tag} a été muté dans ${channel}.`,
              color: 0xff0000,
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
      console.error('Erreur cmute:', error);
      message.reply('Une erreur est survenue lors du mutage de l\'utilisateur.');
    }
  }
};
