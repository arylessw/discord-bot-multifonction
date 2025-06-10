const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'warnings',
  description: 'Affiche les avertissements d\'un utilisateur',
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
            title: '✅ Aucun avertissement',
            description: `${target.user.tag} n'a aucun avertissement.`,
            color: 0x00ff00,
            thumbnail: {
              url: target.user.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
          }]
        });
      }

      // Filtrer les avertissements
      const warnings = sanctions[target.id].filter(s => s.type === 'warn');

      if (!warnings.length) {
        return message.reply({
          embeds: [{
            title: '✅ Aucun avertissement',
            description: `${target.user.tag} n'a aucun avertissement.`,
            color: 0x00ff00,
            thumbnail: {
              url: target.user.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
          }]
        });
      }

      // Créer les champs pour chaque avertissement
      const fields = warnings.map(warning => ({
        name: `🆔 ${warning.id}`,
        value: `**Raison:** ${warning.reason}\n**Date:** ${new Date(warning.date).toLocaleString()}\n**Modérateur:** <@${warning.moderator}>`,
        inline: false
      }));

      // Envoyer le message avec les avertissements
      message.reply({
        embeds: [{
          title: '⚠️ Avertissements',
          description: `Liste des avertissements de ${target.user.tag}`,
          color: 0xffa500,
          thumbnail: {
            url: target.user.displayAvatarURL({ dynamic: true })
          },
          fields: [
            {
              name: '📊 Total',
              value: `${warnings.length} avertissement${warnings.length > 1 ? 's' : ''}`,
              inline: true
            },
            ...fields
          ],
          timestamp: new Date()
        }]
      });
    } catch (error) {
      console.error('Erreur warnings:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la récupération des avertissements.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 