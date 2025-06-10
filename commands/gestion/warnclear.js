const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'warnclear',
  description: 'Supprimer tous les avertissements d\'un membre',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const member = message.mentions.members.first();
    if (!member) {
      return message.reply('Veuillez mentionner un membre.');
    }

    try {
      // Charger le fichier de warnings du serveur
      const warningsFile = path.join(__dirname, '../../warnings', `${message.guild.id}.json`);
      if (!fs.existsSync(warningsFile)) {
        return message.reply('Aucun avertissement n\'a été enregistré sur ce serveur.');
      }

      const warnings = JSON.parse(fs.readFileSync(warningsFile));
      if (!warnings[member.id] || warnings[member.id].length === 0) {
        return message.reply(`${member} n'a aucun avertissement.`);
      }

      // Demander confirmation
      const confirmMessage = await message.reply(
        `Êtes-vous sûr de vouloir supprimer tous les avertissements de ${member} ?\n` +
        'Répondez avec `oui` pour confirmer.'
      );

      try {
        const collected = await message.channel.awaitMessages({
          filter: m => m.author.id === message.author.id && m.content.toLowerCase() === 'oui',
          max: 1,
          time: 30000,
          errors: ['time']
        });

        // Supprimer tous les avertissements du membre
        delete warnings[member.id];

        // Sauvegarder les warnings
        fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

        // Envoyer un message de confirmation
        message.reply(`✅ Tous les avertissements de ${member} ont été supprimés.`);

        // Envoyer dans le canal de logs si configuré
        const config = require('../../config/server_config.json');
        if (config[message.guild.id]?.logChannel) {
          const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
          if (logChannel) {
            const logEmbed = {
              title: '🗑️ Avertissements supprimés',
              fields: [
                {
                  name: '👤 Membre',
                  value: member.toString(),
                  inline: true
                },
                {
                  name: '👮 Modérateur',
                  value: message.author.toString(),
                  inline: true
                }
              ],
              color: 0x00ff00,
              timestamp: new Date()
            };
            logChannel.send({ embeds: [logEmbed] });
          }
        }
      } catch (error) {
        message.reply('❌ Opération annulée.');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression des avertissements:', error);
      message.reply('❌ Une erreur est survenue lors de la suppression des avertissements.');
    }
  }
}; 