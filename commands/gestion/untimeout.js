module.exports = {
  name: 'untimeout',
  description: 'Retire le timeout d\'un membre',
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

    if (member.roles.highest.position >= message.member.roles.highest.position) {
      return message.reply('Vous ne pouvez pas retirer le timeout de ce membre car son rôle est supérieur ou égal au vôtre.');
    }

    if (!member.isCommunicationDisabled()) {
      return message.reply('Ce membre n\'est pas en timeout.');
    }

    const reason = args.slice(1).join(' ') || 'Aucune raison spécifiée';

    try {
      await member.timeout(null, reason);
      
      const embed = {
        title: '✅ Timeout retiré',
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
            name: '📝 Raison',
            value: reason,
            inline: false
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      await member.send({ embeds: [embed] }).catch(() => {
        message.reply('Je n\'ai pas pu envoyer un message privé à ce membre.');
      });

      message.reply({ embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors du retrait du timeout:', error);
      message.reply('Une erreur est survenue lors du retrait du timeout.');
    }
  }
}; 