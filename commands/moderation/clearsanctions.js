const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'clearsanctions',
  description: 'Supprime toutes les sanctions d\'un utilisateur',
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

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!target) {
      return message.reply({
        embeds: [{
          title: '❌ Utilisateur non spécifié',
          description: 'Veuillez mentionner un utilisateur ou fournir son ID.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Charger les sanctions
      const sanctionsFile = path.join(__dirname, '../../data/sanctions', `${message.guild.id}.json`);

      if (!fs.existsSync(sanctionsFile)) {
        return message.reply({
          embeds: [{
            title: '❌ Aucune sanction',
            description: 'Aucune sanction n\'a été trouvée pour ce serveur.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      const sanctions = JSON.parse(fs.readFileSync(sanctionsFile, 'utf8'));

      if (!sanctions[target.id] || !sanctions[target.id].length) {
        return message.reply({
          embeds: [{
            title: '✅ Aucune sanction',
            description: `${target.user.tag} n'a aucune sanction à supprimer.`,
            color: 0x00ff00,
            thumbnail: {
              url: target.user.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
          }]
        });
      }

      // Compter le nombre de chaque type de sanction
      const counts = {
        warn: sanctions[target.id].filter(s => s.type === 'warn').length,
        mute: sanctions[target.id].filter(s => s.type === 'mute').length,
        ban: sanctions[target.id].filter(s => s.type === 'ban').length,
        kick: sanctions[target.id].filter(s => s.type === 'kick').length
      };

      // Supprimer toutes les sanctions de l'utilisateur
      delete sanctions[target.id];

      // Sauvegarder les modifications
      fs.writeFileSync(sanctionsFile, JSON.stringify(sanctions, null, 2));

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '✅ Sanctions supprimées',
          description: `Toutes les sanctions de ${target.user.tag} ont été supprimées.`,
          color: 0x00ff00,
          thumbnail: {
            url: target.user.displayAvatarURL({ dynamic: true })
          },
          fields: [
            {
              name: '👤 Modérateur',
              value: message.author.tag,
              inline: true
            },
            {
              name: '👥 Utilisateur',
              value: target.user.tag,
              inline: true
            },
            {
              name: '📊 Total',
              value: `${counts.warn + counts.mute + counts.ban + counts.kick} sanction${counts.warn + counts.mute + counts.ban + counts.kick > 1 ? 's' : ''}`,
              inline: true
            },
            {
              name: '⚠️ Avertissements',
              value: counts.warn.toString(),
              inline: true
            },
            {
              name: '🔇 Mutes',
              value: counts.mute.toString(),
              inline: true
            },
            {
              name: '🔨 Bans',
              value: counts.ban.toString(),
              inline: true
            },
            {
              name: '👢 Kicks',
              value: counts.kick.toString(),
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
              title: '✅ Sanctions supprimées',
              description: `Toutes les sanctions de ${target.user.tag} ont été supprimées.`,
              color: 0x00ff00,
              thumbnail: {
                url: target.user.displayAvatarURL({ dynamic: true })
              },
              fields: [
                {
                  name: '👤 Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '👥 Utilisateur',
                  value: target.user.tag,
                  inline: true
                },
                {
                  name: '📊 Total',
                  value: `${counts.warn + counts.mute + counts.ban + counts.kick} sanction${counts.warn + counts.mute + counts.ban + counts.kick > 1 ? 's' : ''}`,
                  inline: true
                },
                {
                  name: '⚠️ Avertissements',
                  value: counts.warn.toString(),
                  inline: true
                },
                {
                  name: '🔇 Mutes',
                  value: counts.mute.toString(),
                  inline: true
                },
                {
                  name: '🔨 Bans',
                  value: counts.ban.toString(),
                  inline: true
                },
                {
                  name: '👢 Kicks',
                  value: counts.kick.toString(),
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
      console.error('Erreur clearsanctions:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la suppression des sanctions.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
};
