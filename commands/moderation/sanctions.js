const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'sanctions',
  description: 'Affiche toutes les sanctions d\'un utilisateur',
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
            description: `${target.user.tag} n'a aucune sanction.`,
            color: 0x00ff00,
            thumbnail: {
              url: target.user.displayAvatarURL({ dynamic: true })
            },
            timestamp: new Date()
          }]
        });
      }

      // Trier les sanctions par date (plus récentes en premier)
      const sortedSanctions = sanctions[target.id].sort((a, b) => new Date(b.date) - new Date(a.date));

      // Créer les champs pour chaque sanction
      const fields = sortedSanctions.map(sanction => {
        let emoji = '❓';
        let color = 0x808080;
        switch (sanction.type) {
          case 'warn':
            emoji = '⚠️';
            color = 0xffa500;
            break;
          case 'mute':
            emoji = '🔇';
            color = 0xff0000;
            break;
          case 'ban':
            emoji = '🔨';
            color = 0xff0000;
            break;
          case 'kick':
            emoji = '👢';
            color = 0xff0000;
            break;
        }

        let value = `**Type:** ${emoji} ${sanction.type.charAt(0).toUpperCase() + sanction.type.slice(1)}\n`;
        value += `**Raison:** ${sanction.reason}\n`;
        value += `**Date:** ${new Date(sanction.date).toLocaleString()}\n`;
        value += `**Modérateur:** <@${sanction.moderator}>`;

        if (sanction.duration) {
          value += `\n**Durée:** ${sanction.duration}`;
        }

        return {
          name: `🆔 ${sanction.id}`,
          value: value,
          inline: false
        };
      });

      // Compter le nombre de chaque type de sanction
      const counts = {
        warn: sortedSanctions.filter(s => s.type === 'warn').length,
        mute: sortedSanctions.filter(s => s.type === 'mute').length,
        ban: sortedSanctions.filter(s => s.type === 'ban').length,
        kick: sortedSanctions.filter(s => s.type === 'kick').length
      };

      // Envoyer le message avec les sanctions
      message.reply({
        embeds: [{
          title: '📋 Sanctions',
          description: `Liste des sanctions de ${target.user.tag}`,
          color: 0x808080,
          thumbnail: {
            url: target.user.displayAvatarURL({ dynamic: true })
          },
          fields: [
            {
              name: '📊 Total',
              value: `${sortedSanctions.length} sanction${sortedSanctions.length > 1 ? 's' : ''}`,
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
            ...fields
          ],
          timestamp: new Date()
        }]
      });
    } catch (error) {
      console.error('Erreur sanctions:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la récupération des sanctions.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
};
