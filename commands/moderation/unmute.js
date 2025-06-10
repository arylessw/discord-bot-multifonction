const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'unmute',
  description: 'Retire la mise en sourdine d\'un utilisateur',
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

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission de modérer les membres pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.guild.members.me.permissions.has('ModerateMembers')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Je n\'ai pas la permission de modérer les membres.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const targetUser = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!targetUser) {
      return message.reply({
        embeds: [{
          title: '❌ Utilisateur non spécifié',
          description: 'Veuillez mentionner un utilisateur ou fournir son ID.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!targetUser.moderatable) {
      return message.reply({
        embeds: [{
          title: '❌ Impossible de retirer la mise en sourdine',
          description: 'Je ne peux pas retirer la mise en sourdine de cet utilisateur car son rôle est plus élevé que le mien.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (targetUser.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({
        embeds: [{
          title: '❌ Permission insuffisante',
          description: 'Vous ne pouvez pas retirer la mise en sourdine de cet utilisateur car son rôle est plus élevé ou égal au vôtre.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!targetUser.isCommunicationDisabled()) {
      return message.reply({
        embeds: [{
          title: '❌ Utilisateur non en sourdine',
          description: 'Cet utilisateur n\'est pas en sourdine.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Retirer la mise en sourdine
      await targetUser.timeout(null);

      // Envoyer un message à l'utilisateur
      try {
        await targetUser.send({
          embeds: [{
            title: '🔊 Fin de la mise en sourdine',
            description: `Votre mise en sourdine a été retirée dans ${message.guild.name}.`,
            color: 0x00ff00,
            fields: [
              {
                name: '👤 Modérateur',
                value: message.author.tag,
                inline: true
              }
            ],
            timestamp: new Date()
          }]
        });
      } catch (error) {
        console.error('Erreur envoi DM:', error);
      }

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '✅ Mise en sourdine retirée',
          description: `La mise en sourdine de ${targetUser.user.tag} a été retirée.`,
          color: 0x00ff00,
          fields: [
            {
              name: '👤 Modérateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: '👥 Utilisateur',
              value: targetUser.user.tag,
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
              title: '🔊 Fin de la mise en sourdine',
              description: `La mise en sourdine de ${targetUser.user.tag} a été retirée.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '👥 Utilisateur',
                  value: targetUser.user.tag,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur unmute:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors du retrait de la mise en sourdine.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
};
