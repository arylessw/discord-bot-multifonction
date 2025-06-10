const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'rename',
  description: 'Renommer un membre du serveur',
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

    const newNickname = args.slice(1).join(' ');
    if (!newNickname) {
      return message.reply('Veuillez spécifier un nouveau pseudonyme.');
    }

    if (newNickname.length > 32) {
      return message.reply('Le pseudonyme ne peut pas dépasser 32 caractères.');
    }

    try {
      const oldNickname = member.nickname || member.user.username;
      await member.setNickname(newNickname, `Renommé par ${message.author.tag}`);

      // Envoyer un message de confirmation
      message.reply(`✅ ${member} a été renommé de "${oldNickname}" à "${newNickname}".`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '✏️ Membre renommé',
            fields: [
              {
                name: '👤 Membre',
                value: member.toString(),
                inline: true
              },
              {
                name: '📝 Ancien pseudonyme',
                value: oldNickname,
                inline: true
              },
              {
                name: '📝 Nouveau pseudonyme',
                value: newNickname,
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
      console.error('Erreur lors du renommage du membre:', error);
      message.reply('❌ Une erreur est survenue lors du renommage du membre.');
    }
  }
}; 