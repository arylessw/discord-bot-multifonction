const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'warnremove',
  description: 'Supprimer un avertissement d\'un membre',
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

    const warningIndex = parseInt(args[1]);
    if (isNaN(warningIndex) || warningIndex < 1) {
      return message.reply('Veuillez spécifier un numéro d\'avertissement valide.');
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

      if (warningIndex > warnings[member.id].length) {
        return message.reply(`L'avertissement #${warningIndex} n'existe pas.`);
      }

      // Supprimer l'avertissement
      const removedWarning = warnings[member.id].splice(warningIndex - 1, 1)[0];

      // Sauvegarder les warnings
      fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

      // Envoyer un message de confirmation
      message.reply(`✅ L'avertissement #${warningIndex} de ${member} a été supprimé.`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🗑️ Avertissement supprimé',
            fields: [
              {
                name: '👤 Membre',
                value: member.toString(),
                inline: true
              },
              {
                name: '📝 Raison de l\'avertissement',
                value: removedWarning.reason,
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
      console.error('Erreur lors de la suppression de l\'avertissement:', error);
      message.reply('❌ Une erreur est survenue lors de la suppression de l\'avertissement.');
    }
  }
}; 