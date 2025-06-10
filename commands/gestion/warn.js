const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'warn',
  description: 'Avertir un membre du serveur',
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

    const reason = args.slice(1).join(' ');
    if (!reason) {
      return message.reply('Veuillez spécifier une raison pour l\'avertissement.');
    }

    try {
      // Créer le dossier warnings s'il n'existe pas
      const warningsDir = path.join(__dirname, '../../warnings');
      if (!fs.existsSync(warningsDir)) {
        fs.mkdirSync(warningsDir);
      }

      // Charger ou créer le fichier de warnings du serveur
      const warningsFile = path.join(warningsDir, `${message.guild.id}.json`);
      let warnings = {};
      if (fs.existsSync(warningsFile)) {
        warnings = JSON.parse(fs.readFileSync(warningsFile));
      }

      // Initialiser le tableau de warnings du membre s'il n'existe pas
      if (!warnings[member.id]) {
        warnings[member.id] = [];
      }

      // Ajouter le warning
      const warning = {
        reason,
        moderator: message.author.id,
        date: new Date().toISOString()
      };
      warnings[member.id].push(warning);

      // Sauvegarder les warnings
      fs.writeFileSync(warningsFile, JSON.stringify(warnings, null, 2));

      // Envoyer un message de confirmation
      message.reply(`✅ ${member} a reçu un avertissement pour: ${reason}`);

      // Envoyer un message privé au membre
      try {
        const dmEmbed = new MessageEmbed()
          .setTitle('⚠️ Avertissement')
          .setDescription(`Vous avez reçu un avertissement sur ${message.guild.name}`)
          .addField('Raison', reason)
          .addField('Modérateur', message.author.tag)
          .setColor(0xff0000)
          .setTimestamp();
        await member.send({ embeds: [dmEmbed] });
      } catch (error) {
        console.error('Impossible d\'envoyer un message privé au membre:', error);
      }

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '⚠️ Avertissement donné',
            fields: [
              {
                name: '👤 Membre',
                value: member.toString(),
                inline: true
              },
              {
                name: '📝 Raison',
                value: reason,
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0xff0000,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de l\'avertissement:', error);
      message.reply('❌ Une erreur est survenue lors de l\'avertissement.');
    }
  }
}; 