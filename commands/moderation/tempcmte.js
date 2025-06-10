module.exports = {
  name: 'tempcmte',
  description: 'Met en sourdine temporairement un utilisateur dans un canal spécifique',
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

    // Vérifier si une durée est spécifiée
    const duration = args[1];
    if (!duration) {
      return message.reply('Veuillez spécifier une durée (ex: 1h, 30m, 1d).');
    }

    // Convertir la durée en millisecondes
    const timeRegex = /^(\d+)([mhd])$/;
    const match = duration.match(timeRegex);
    if (!match) {
      return message.reply('Format de durée invalide. Utilisez le format: 1h, 30m, 1d');
    }

    const [, amount, unit] = match;
    const ms = {
      'm': 60 * 1000,
      'h': 60 * 60 * 1000,
      'd': 24 * 60 * 60 * 1000
    }[unit] * parseInt(amount);

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
          title: '🔇 Utilisateur muté temporairement',
          description: `${target.user.tag} a été muté dans ${channel} pour ${duration}.`,
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
              name: 'Durée',
              value: duration,
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
              title: '🔇 Utilisateur muté temporairement dans un canal',
              description: `${target.user.tag} a été muté dans ${channel} pour ${duration}.`,
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
                  name: 'Durée',
                  value: duration,
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

      // Définir un timeout pour démuté l'utilisateur
      setTimeout(async () => {
        try {
          await channel.permissionOverwrites.edit(target, {
            SendMessages: null
          });

          // Envoyer un message de confirmation
          message.channel.send({
            embeds: [{
              title: '🔊 Mute temporaire terminé',
              description: `${target.user.tag} a été démuté dans ${channel}.`,
              color: 0x00ff00,
              fields: [
                {
                  name: 'Canal',
                  value: channel.name,
                  inline: true
                },
                {
                  name: 'Durée initiale',
                  value: duration,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });

          // Envoyer un message dans le canal de logs
          if (config[message.guild.id]?.logChannel) {
            const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
            if (logChannel) {
              logChannel.send({
                embeds: [{
                  title: '🔊 Mute temporaire terminé',
                  description: `${target.user.tag} a été démuté dans ${channel}.`,
                  color: 0x00ff00,
                  fields: [
                    {
                      name: 'Canal',
                      value: channel.name,
                      inline: true
                    },
                    {
                      name: 'Durée initiale',
                      value: duration,
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
          console.error('Erreur lors du démutage automatique:', error);
        }
      }, ms);
    } catch (error) {
      console.error('Erreur tempcmte:', error);
      message.reply('Une erreur est survenue lors du mutage temporaire de l\'utilisateur.');
    }
  }
};
