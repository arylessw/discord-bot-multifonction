const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'clearallsanctions',
  description: 'Efface toutes les sanctions du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const sanctionsDir = path.join(__dirname, '../../sanctions');
    const sanctionFile = path.join(sanctionsDir, `${message.guild.id}.json`);

    try {
      // Vérifier si le fichier de sanctions existe
      if (!fs.existsSync(sanctionFile)) {
        return message.reply({
          embeds: [{
            title: '📋 Sanctions',
            description: 'Aucune sanction n\'existe pour ce serveur.',
            color: 0x00ff00,
            thumbnail: {
              url: message.guild.iconURL({ dynamic: true })
            },
            timestamp: new Date()
          }]
        });
      }

      // Charger les sanctions
      const sanctions = JSON.parse(fs.readFileSync(sanctionFile, 'utf8'));

      if (sanctions.length === 0) {
        return message.reply({
          embeds: [{
            title: '📋 Sanctions',
            description: 'Aucune sanction n\'existe pour ce serveur.',
            color: 0x00ff00,
            thumbnail: {
              url: message.guild.iconURL({ dynamic: true })
            },
            timestamp: new Date()
          }]
        });
      }

      // Calculer les statistiques
      const stats = {
        total: sanctions.length,
        warns: sanctions.filter(s => s.type === 'WARN').length,
        kicks: sanctions.filter(s => s.type === 'KICK').length,
        bans: sanctions.filter(s => s.type === 'BAN').length,
        mutes: sanctions.filter(s => s.type === 'MUTE').length,
        users: new Set(sanctions.map(s => s.userId)).size
      };

      // Trier les sanctions par date
      sanctions.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Demander confirmation
      const confirmMessage = await message.reply({
        embeds: [{
          title: '⚠️ Confirmation de suppression',
          description: 'Êtes-vous sûr de vouloir effacer toutes les sanctions du serveur ?\n' +
                      'Cette action est irréversible.',
          color: 0xff0000,
          thumbnail: {
            url: message.guild.iconURL({ dynamic: true })
          },
          fields: [
            {
              name: '📊 Statistiques des sanctions',
              value: `**Total:** ${stats.total}\n` +
                     `**Utilisateurs concernés:** ${stats.users}\n` +
                     `**Avertissements:** ${stats.warns}\n` +
                     `**Exclusions:** ${stats.kicks}\n` +
                     `**Bannissements:** ${stats.bans}\n` +
                     `**Mutes:** ${stats.mutes}`,
              inline: true
            },
            {
              name: '📅 Informations',
              value: `**Première sanction:** ${new Date(sanctions[sanctions.length - 1].timestamp).toLocaleString()}\n` +
                     `**Dernière sanction:** ${new Date(sanctions[0].timestamp).toLocaleString()}`,
              inline: true
            }
          ],
          timestamp: new Date()
        }]
      });

      // Ajouter les réactions
      await confirmMessage.react('✅');
      await confirmMessage.react('❌');

      // Attendre la réaction
      const filter = (reaction, user) => 
        ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;

      const collected = await confirmMessage.awaitReactions({ filter, max: 1, time: 30000 });

      // Vérifier la réaction
      const reaction = collected.first();
      if (!reaction || reaction.emoji.name === '❌') {
        return message.reply({
          embeds: [{
            title: '❌ Opération annulée',
            description: 'La suppression des sanctions a été annulée.',
            color: 0xff0000,
            timestamp: new Date()
          }]
        });
      }

      // Supprimer le fichier de sanctions
      fs.unlinkSync(sanctionFile);

      message.reply({
        embeds: [{
          title: '✅ Sanctions effacées',
          description: 'Toutes les sanctions du serveur ont été effacées.',
          color: 0x00ff00,
          thumbnail: {
            url: message.guild.iconURL({ dynamic: true })
          },
          fields: [
            {
              name: '📊 Détails',
              value: `**Nombre de sanctions supprimées:** ${stats.total}\n` +
                     `**Utilisateurs concernés:** ${stats.users}\n` +
                     `**Date de suppression:** ${new Date().toLocaleString()}\n` +
                     `**Modérateur:** ${message.author.tag}`,
              inline: false
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
              title: '✅ Toutes les sanctions effacées',
              description: 'Toutes les sanctions du serveur ont été effacées.',
              color: 0x00ff00,
              thumbnail: {
                url: message.guild.iconURL({ dynamic: true })
              },
              fields: [
                {
                  name: '👤 Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '📊 Statistiques',
                  value: `**Total:** ${stats.total}\n` +
                         `**Utilisateurs:** ${stats.users}\n` +
                         `**Avertissements:** ${stats.warns}\n` +
                         `**Exclusions:** ${stats.kicks}\n` +
                         `**Bannissements:** ${stats.bans}\n` +
                         `**Mutes:** ${stats.mutes}`,
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
      console.error('Erreur clearallsanctions:', error);
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
