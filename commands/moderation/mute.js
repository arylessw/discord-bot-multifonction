const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'mute',
  description: 'Rend muet un utilisateur',
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
          title: '❌ Impossible de rendre muet',
          description: 'Je ne peux pas rendre muet cet utilisateur car son rôle est plus élevé que le mien.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (targetUser.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply({
        embeds: [{
          title: '❌ Permission insuffisante',
          description: 'Vous ne pouvez pas rendre muet cet utilisateur car son rôle est plus élevé ou égal au vôtre.',
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
          description: 'Veuillez spécifier une durée (ex: 1m, 1h, 1d).',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const durationRegex = /^(\d+)([mhd])$/;
    const match = duration.match(durationRegex);
    if (!match) {
      return message.reply({
        embeds: [{
          title: '❌ Format de durée invalide',
          description: 'Le format de la durée doit être : nombre + unité (m = minutes, h = heures, d = jours).',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const [, amount, unit] = match;
    let milliseconds;
    switch (unit) {
      case 'm':
        milliseconds = parseInt(amount) * 60 * 1000;
        break;
      case 'h':
        milliseconds = parseInt(amount) * 60 * 60 * 1000;
        break;
      case 'd':
        milliseconds = parseInt(amount) * 24 * 60 * 60 * 1000;
        break;
    }

    if (milliseconds < 60000 || milliseconds > 2419200000) {
      return message.reply({
        embeds: [{
          title: '❌ Durée invalide',
          description: 'La durée doit être comprise entre 1 minute et 28 jours.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    const reason = args.slice(2).join(' ') || 'Aucune raison spécifiée';

    try {
      // Créer le dossier sanctions s'il n'existe pas
      const sanctionsDir = path.join(__dirname, '../../data/sanctions');
      if (!fs.existsSync(sanctionsDir)) {
        fs.mkdirSync(sanctionsDir, { recursive: true });
      }

      // Charger les sanctions existantes
      const sanctionsFile = path.join(sanctionsDir, `${message.guild.id}.json`);
      let sanctions = {};
      if (fs.existsSync(sanctionsFile)) {
        sanctions = JSON.parse(fs.readFileSync(sanctionsFile, 'utf8'));
      }

      // Créer un nouvel ID de sanction
      const sanctionId = Date.now().toString();

      // Ajouter la sanction
      if (!sanctions[targetUser.id]) {
        sanctions[targetUser.id] = [];
      }
      sanctions[targetUser.id].push({
        type: 'mute',
        moderator: message.author.id,
        reason: reason,
        date: Date.now(),
        duration: milliseconds,
        id: sanctionId
      });

      // Sauvegarder les sanctions
      fs.writeFileSync(sanctionsFile, JSON.stringify(sanctions, null, 2));

      // Envoyer un message à l'utilisateur
      try {
        await targetUser.send({
          embeds: [{
            title: '🔇 Mise en sourdine',
            description: `Vous avez été mis en sourdine dans ${message.guild.name}.`,
            color: 0xffa500,
            fields: [
              {
                name: '👤 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '⏱️ Durée',
                value: duration,
                inline: true
              },
              {
                name: '📝 Raison',
                value: reason,
                inline: false
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
      }

      // Mettre en sourdine l'utilisateur
      await targetUser.timeout(milliseconds, `${message.author.tag}: ${reason}`);

      // Envoyer un message de confirmation
      message.reply({
        embeds: [{
          title: '✅ Utilisateur mis en sourdine',
          description: `${targetUser.user.tag} a été mis en sourdine.`,
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
              name: '⏱️ Durée',
              value: duration,
              inline: true
            },
            {
              name: '📝 Raison',
              value: reason,
              inline: false
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

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '🔇 Mise en sourdine',
              description: `${targetUser.user.tag} a été mis en sourdine.`,
              color: 0xffa500,
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
                  name: '⏱️ Durée',
                  value: duration,
                  inline: true
                },
                {
                  name: '📝 Raison',
                  value: reason,
                  inline: false
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
      console.error('Erreur mute:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la mise en sourdine.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
};
