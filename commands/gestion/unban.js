const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'unban',
  description: 'Débannir un membre du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (args.length === 0) {
      return message.reply(
        'Veuillez spécifier l\'ID ou le tag du membre à débannir.\n' +
        'Utilisation: `!unban <ID/tag>`'
      );
    }

    try {
      const bans = await message.guild.bans.fetch();
      let bannedUser = null;

      // Rechercher par ID
      if (/^\d+$/.test(args[0])) {
        bannedUser = bans.find(ban => ban.user.id === args[0]);
      } else {
        // Rechercher par tag
        const tag = args.join(' ');
        bannedUser = bans.find(ban => ban.user.tag === tag);
      }

      if (!bannedUser) {
        return message.reply('Ce membre n\'est pas banni.');
      }

      await message.guild.members.unban(bannedUser.user, `Débanni par ${message.author.tag}`);
      message.reply(`✅ ${bannedUser.user.tag} a été débanni.`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🔓 Membre débanni',
            fields: [
              {
                name: '👤 Membre',
                value: bannedUser.user.tag,
                inline: true
              },
              {
                name: '🆔 ID',
                value: bannedUser.user.id,
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
      console.error('Erreur lors du débannissement:', error);
      message.reply('❌ Une erreur est survenue lors du débannissement.');
    }
  }
}; 