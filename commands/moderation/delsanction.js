const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'delsanction',
  description: 'Supprime une sanction spécifique',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (!args[0]) {
      return message.reply('Veuillez fournir l\'ID de la sanction à supprimer.');
    }

    const sanctionId = args[0];
    const sanctionsDir = path.join(__dirname, '../../sanctions');
    const sanctionFile = path.join(sanctionsDir, `${message.guild.id}.json`);

    try {
      // Vérifier si le fichier de sanctions existe
      if (!fs.existsSync(sanctionFile)) {
        return message.reply('Aucune sanction n\'existe pour ce serveur.');
      }

      // Charger les sanctions
      const sanctions = JSON.parse(fs.readFileSync(sanctionFile, 'utf8'));

      // Trouver la sanction
      const sanction = sanctions.find(s => s.id === sanctionId);
      if (!sanction) {
        return message.reply('Aucune sanction trouvée avec cet ID.');
      }

      // Demander confirmation
      const confirmMessage = await message.reply({
        embeds: [{
          title: '⚠️ Confirmation de suppression',
          description: 'Êtes-vous sûr de vouloir supprimer cette sanction ?\n' +
                      'Cette action est irréversible.',
          color: 0xff0000,
          fields: [
            {
              name: 'Détails de la sanction',
              value: `**Type:** ${sanction.type}\n` +
                     `**Utilisateur:** <@${sanction.userId}>\n` +
                     `**Modérateur:** ${sanction.moderator}\n` +
                     `**Raison:** ${sanction.reason || 'Aucune'}\n` +
                     `**Date:** ${new Date(sanction.timestamp).toLocaleString()}`
            }
          ]
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
        return message.reply('Suppression de la sanction annulée.');
      }

      // Supprimer la sanction
      const newSanctions = sanctions.filter(s => s.id !== sanctionId);
      fs.writeFileSync(sanctionFile, JSON.stringify(newSanctions, null, 2));

      message.reply({
        embeds: [{
          title: '✅ Sanction supprimée',
          description: 'La sanction a été supprimée avec succès.',
          color: 0x00ff00,
          fields: [
            {
              name: 'Détails',
              value: `**Type:** ${sanction.type}\n` +
                     `**Utilisateur:** <@${sanction.userId}>\n` +
                     `**Date de suppression:** ${new Date().toLocaleString()}`
            }
          ]
        }]
      });

      // Envoyer un message dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '✅ Sanction supprimée',
              description: 'Une sanction a été supprimée.',
              color: 0x00ff00,
              fields: [
                {
                  name: 'Modérateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: 'Utilisateur',
                  value: `<@${sanction.userId}>`,
                  inline: true
                },
                {
                  name: 'Type',
                  value: sanction.type,
                  inline: true
                },
                {
                  name: 'Date de suppression',
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
      console.error('Erreur delsanction:', error);
      message.reply('Une erreur est survenue lors de la suppression de la sanction.');
    }
  }
};
