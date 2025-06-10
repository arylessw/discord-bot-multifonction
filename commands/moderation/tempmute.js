const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'tempmute',
  description: 'Met en sourdine temporairement un utilisateur',
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

    if (!target.moderatable) {
      return message.reply({
        embeds: [{
          title: '❌ Impossible de mettre en sourdine',
          description: 'Je ne peux pas mettre en sourdine cet utilisateur. Vérifiez que mon rôle est plus haut que celui de l\'utilisateur.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const duration = args[1];
    if (!duration) {
      return message.reply({
        embeds: [{
          title: '❌ Durée non spécifiée',
          description: 'Veuillez spécifier une durée (ex: 1d, 12h, 30m).',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';

    // Convertir la durée en millisecondes
    const durationMatch = duration.match(/^(\d+)([mhd])$/);
    if (!durationMatch) {
      return message.reply({
        embeds: [{
          title: '❌ Format de durée invalide',
          description: 'Le format de la durée doit être : nombre + unité (m = minutes, h = heures, d = jours).\nExemple : 1d, 12h, 30m',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const [, amount, unit] = durationMatch;
    const durationMs = {
      'm': parseInt(amount) * 60 * 1000,
      'h': parseInt(amount) * 60 * 60 * 1000,
      'd': parseInt(amount) * 24 * 60 * 60 * 1000
    }[unit];

    try {
      // Créer le dossier sanctions s'il n'existe pas
      const sanctionsDir = path.join(__dirname, '../../sanctions');
      if (!fs.existsSync(sanctionsDir)) {
        fs.mkdirSync(sanctionsDir, { recursive: true });
      }

      // Chemin du fichier de sanctions
      const sanctionsFile = path.join(sanctionsDir, `${message.guild.id}.json`);

      // Charger les sanctions existantes ou créer un nouveau fichier
      let sanctions = [];
      if (fs.existsSync(sanctionsFile)) {
        const data = fs.readFileSync(sanctionsFile, 'utf8');
        sanctions = JSON.parse(data);
      }

      // Créer la nouvelle sanction
      const newSanction = {
        id: Date.now().toString(),
        type: 'tempmute',
        userId: target.id,
        userTag: target.user.tag,
        moderatorId: message.author.id,
        moderatorTag: message.author.tag,
        reason: reason,
        date: new Date().toISOString(),
        duration: durationMs,
        endDate: new Date(Date.now() + durationMs).toISOString()
      };

      // Ajouter la sanction
      sanctions.push(newSanction);

      // Sauvegarder les sanctions
      fs.writeFileSync(sanctionsFile, JSON.stringify(sanctions, null, 2));

      // Mettre en sourdine l'utilisateur
      await target.timeout(durationMs, reason);

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '🔇 Sourdine temporaire',
          description: `${target.user.tag} a été mis en sourdine temporairement.`,
          color: 0xffa500,
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
              name: '📝 Raison',
              value: reason,
              inline: true
            },
            {
              name: '⏱️ Durée',
              value: duration,
              inline: true
            },
            {
              name: '📅 Fin de la sourdine',
              value: new Date(Date.now() + durationMs).toLocaleString(),
              inline: true
            },
            {
              name: '🆔 ID de la sanction',
              value: newSanction.id,
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
              title: '🔇 Sourdine temporaire',
              description: `${target.user.tag} a été mis en sourdine temporairement.`,
              color: 0xffa500,
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
                  name: '📝 Raison',
                  value: reason,
                  inline: true
                },
                {
                  name: '⏱️ Durée',
                  value: duration,
                  inline: true
                },
                {
                  name: '📅 Fin de la sourdine',
                  value: new Date(Date.now() + durationMs).toLocaleString(),
                  inline: true
                },
                {
                  name: '🆔 ID de la sanction',
                  value: newSanction.id,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
        }
      }

      // Envoyer un message privé à l'utilisateur
      try {
        await target.send({
          embeds: [{
            title: '🔇 Sourdine temporaire',
            description: `Vous avez été mis en sourdine temporairement sur ${message.guild.name}.`,
            color: 0xffa500,
            fields: [
              {
                name: '👤 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '📝 Raison',
                value: reason,
                inline: true
              },
              {
                name: '⏱️ Durée',
                value: duration,
                inline: true
              },
              {
                name: '📅 Fin de la sourdine',
                value: new Date(Date.now() + durationMs).toLocaleString(),
                inline: true
              }
            ],
            timestamp: new Date()
          }]
        });
      } catch (error) {
        console.error('Impossible d\'envoyer un message privé à l\'utilisateur:', error);
      }

      // Programmer la fin de la sourdine
      setTimeout(async () => {
        try {
          await target.timeout(null, 'Fin de la sourdine temporaire');
          
          // Envoyer un message dans le canal de logs si configuré
          if (config[message.guild.id]?.logChannel) {
            const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
            if (logChannel) {
              logChannel.send({
                embeds: [{
                  title: '🔊 Fin de la sourdine',
                  description: `${target.user.tag} n'est plus en sourdine.`,
                  color: 0x00ff00,
                  thumbnail: {
                    url: target.user.displayAvatarURL({ dynamic: true })
                  },
                  fields: [
                    {
                      name: '📝 Raison',
                      value: 'Fin de la sourdine temporaire',
                      inline: true
                    },
                    {
                      name: '🆔 ID de la sanction',
                      value: newSanction.id,
                      inline: true
                    }
                  ],
                  timestamp: new Date()
                }]
              });
            }
          }
        } catch (error) {
          console.error('Erreur lors de la fin de la sourdine automatique:', error);
        }
      }, durationMs);
    } catch (error) {
      console.error('Erreur tempmute:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la mise en sourdine temporaire de l\'utilisateur.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
};
