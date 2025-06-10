const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'unwarn',
  description: 'Retire un avertissement d\'un utilisateur',
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

    const sanctionId = args[1];
    if (!sanctionId) {
      return message.reply({
        embeds: [{
          title: '❌ ID non spécifié',
          description: 'Veuillez spécifier l\'ID de l\'avertissement à retirer.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Charger le fichier de sanctions
      const sanctionsFile = path.join(__dirname, '../../data/sanctions', `${message.guild.id}.json`);
      if (!fs.existsSync(sanctionsFile)) {
        return message.reply({
          embeds: [{
            title: '❌ Aucun avertissement',
            description: `${targetUser.user.tag} n'a aucun avertissement.`,
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      const sanctions = JSON.parse(fs.readFileSync(sanctionsFile, 'utf8'));
      if (!sanctions[targetUser.id] || sanctions[targetUser.id].length === 0) {
        return message.reply({
          embeds: [{
            title: '❌ Aucun avertissement',
            description: `${targetUser.user.tag} n'a aucun avertissement.`,
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Trouver l'avertissement à retirer
      const warnIndex = sanctions[targetUser.id].findIndex(warn => warn.id === sanctionId);
      if (warnIndex === -1) {
        return message.reply({
          embeds: [{
            title: '❌ Avertissement non trouvé',
            description: `L'avertissement avec l'ID ${sanctionId} n'a pas été trouvé pour ${targetUser.user.tag}.`,
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Sauvegarder les informations de l'avertissement
      const warnInfo = sanctions[targetUser.id][warnIndex];

      // Retirer l'avertissement
      sanctions[targetUser.id].splice(warnIndex, 1);

      // Sauvegarder les sanctions
      fs.writeFileSync(sanctionsFile, JSON.stringify(sanctions, null, 2));

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '✅ Avertissement retiré',
          description: `L'avertissement de ${targetUser.user.tag} a été retiré.`,
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
              name: '📝 Raison originale',
              value: warnInfo.reason,
              inline: false
            },
            {
              name: '📅 Date originale',
              value: new Date(warnInfo.date).toLocaleString(),
              inline: true
            },
            {
              name: '🆔 ID de la sanction',
              value: sanctionId,
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
            title: '✅ Avertissement retiré',
            description: `Un de vos avertissements a été retiré dans ${message.guild.name}.`,
            color: 0x00ff00,
            fields: [
              {
                name: '👤 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '📝 Raison originale',
                value: warnInfo.reason,
                inline: false
              },
              {
                name: '📅 Date originale',
                value: new Date(warnInfo.date).toLocaleString(),
                inline: true
              },
              {
                name: '🆔 ID de la sanction',
                value: sanctionId,
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
              title: '✅ Avertissement retiré',
              description: `L'avertissement de ${targetUser.user.tag} a été retiré.`,
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
                  name: '📝 Raison originale',
                  value: warnInfo.reason,
                  inline: false
                },
                {
                  name: '📅 Date originale',
                  value: new Date(warnInfo.date).toLocaleString(),
                  inline: true
                },
                {
                  name: '🆔 ID de la sanction',
                  value: sanctionId,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur unwarn:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors du retrait de l\'avertissement.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 