const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'unban',
  description: 'Débannit un utilisateur du serveur',
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

    if (!message.member.permissions.has('BanMembers')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission de bannir des membres pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.guild.members.me.permissions.has('BanMembers')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Je n\'ai pas la permission de débannir des membres.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const userId = args[0];
    if (!userId) {
      return message.reply({
        embeds: [{
          title: '❌ ID non spécifié',
          description: 'Veuillez spécifier l\'ID de l\'utilisateur à débannir.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Récupérer la liste des bannissements
      const bans = await message.guild.bans.fetch();
      const bannedUser = bans.find(ban => ban.user.id === userId);

      if (!bannedUser) {
        return message.reply({
          embeds: [{
            title: '❌ Utilisateur non banni',
            description: 'Cet utilisateur n\'est pas banni du serveur.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Débannir l'utilisateur
      await message.guild.members.unban(userId);

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '✅ Utilisateur débanni',
          description: `${bannedUser.user.tag} a été débanni du serveur.`,
          color: 0x00ff00,
          fields: [
            {
              name: '👤 Modérateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: '👥 Utilisateur',
              value: bannedUser.user.tag,
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
              title: '🔓 Débannissement',
              description: `${bannedUser.user.tag} a été débanni du serveur.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '👥 Utilisateur',
                  value: bannedUser.user.tag,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur unban:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors du débannissement.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 