module.exports = {
  name: 'unwarn',
  description: 'Retire un avertissement d\'un membre',
  category: 'Gestion',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ModerateMembers')) {
      return message.reply('Vous n\'avez pas la permission de modérer les membres.');
    }

    const member = message.mentions.members.first() || 
      message.guild.members.cache.get(args[0]) ||
      message.guild.members.cache.find(m => m.user.tag.toLowerCase() === args.join(' ').toLowerCase());

    if (!member) {
      return message.reply('Veuillez mentionner un membre valide.');
    }

    const warnIndex = parseInt(args[1]);
    if (isNaN(warnIndex) || warnIndex < 1) {
      return message.reply('Veuillez spécifier un numéro d\'avertissement valide.');
    }

    try {
      const config = require('../../config/server_config.json');
      if (!config[message.guild.id]?.warns?.[member.id]) {
        return message.reply('Ce membre n\'a aucun avertissement.');
      }

      const warns = config[message.guild.id].warns[member.id];
      if (warnIndex > warns.length) {
        return message.reply(`Ce membre n'a que ${warns.length} avertissement(s).`);
      }

      const removedWarn = warns.splice(warnIndex - 1, 1)[0];
      require('fs').writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      const embed = {
        title: '✅ Avertissement retiré',
        fields: [
          {
            name: '👤 Membre',
            value: `${member.user.tag} (${member.id})`,
            inline: true
          },
          {
            name: '👮 Modérateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '📝 Avertissement retiré',
            value: removedWarn.reason,
            inline: false
          },
          {
            name: '📊 Avertissements restants',
            value: `${warns.length} avertissement(s)`,
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors du retrait de l\'avertissement:', error);
      message.reply('Une erreur est survenue lors du retrait de l\'avertissement.');
    }
  }
}; 