module.exports = {
  name: 'addrole',
  description: 'Ajoute un rôle à un utilisateur',
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

    if (!message.member.permissions.has('ManageRoles')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission de gérer les rôles pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.guild.members.me.permissions.has('ManageRoles')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Je n\'ai pas la permission de gérer les rôles.',
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

    const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
    if (!role) {
      return message.reply({
        embeds: [{
          title: '❌ Rôle non spécifié',
          description: 'Veuillez mentionner un rôle ou fournir son ID.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (role.managed) {
      return message.reply({
        embeds: [{
          title: '❌ Rôle géré',
          description: 'Ce rôle est géré par une intégration et ne peut pas être attribué manuellement.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (role.position >= message.guild.members.me.roles.highest.position) {
      return message.reply({
        embeds: [{
          title: '❌ Rôle trop élevé',
          description: 'Je ne peux pas attribuer ce rôle car il est plus élevé que mon rôle le plus haut.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (role.position >= message.member.roles.highest.position) {
      return message.reply({
        embeds: [{
          title: '❌ Rôle trop élevé',
          description: 'Vous ne pouvez pas attribuer ce rôle car il est plus élevé que votre rôle le plus haut.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (targetUser.roles.cache.has(role.id)) {
      return message.reply({
        embeds: [{
          title: '❌ Rôle déjà attribué',
          description: `${targetUser.user.tag} a déjà le rôle ${role}.`,
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Ajouter le rôle
      await targetUser.roles.add(role);

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '✅ Rôle ajouté',
          description: `Le rôle ${role} a été ajouté à ${targetUser.user.tag}.`,
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
            },
            {
              name: '🎭 Rôle',
              value: role.toString(),
              inline: true
            },
            {
              name: '📅 Date',
              value: new Date().toLocaleString(),
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });

      // Envoyer un message à l'utilisateur
      try {
        await targetUser.send({
          embeds: [{
            title: '✅ Rôle ajouté',
            description: `Le rôle ${role} vous a été ajouté dans ${message.guild.name}.`,
            color: 0x00ff00,
            fields: [
              {
                name: '👤 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '🎭 Rôle',
                value: role.toString(),
                inline: true
              },
              {
                name: '📅 Date',
                value: new Date().toLocaleString(),
                inline: true
              }
            ],
            timestamp: new Date()
          }]
        });
      } catch (error) {
        console.error('Erreur envoi DM:', error);
        message.channel.send({
          embeds: [{
            title: '⚠️ Message non envoyé',
            description: `Je n'ai pas pu envoyer un message privé à ${targetUser.user.tag}.`,
            color: 0xffa500,
            timestamp: new Date()
          }]
        });
      }

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '✅ Rôle ajouté',
              description: `Le rôle ${role} a été ajouté à ${targetUser.user.tag}.`,
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
                },
                {
                  name: '🎭 Rôle',
                  value: role.toString(),
                  inline: true
                },
                {
                  name: '📅 Date',
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
      console.error('Erreur addrole:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de l\'ajout du rôle.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 