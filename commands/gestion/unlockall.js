const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'unlockall',
  description: 'Déverrouiller tous les salons textuels',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    try {
      const textChannels = message.guild.channels.cache.filter(
        channel => channel.type === 'GUILD_TEXT'
      );

      let unlockedCount = 0;
      let failedCount = 0;

      for (const channel of textChannels.values()) {
        try {
          await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
            SEND_MESSAGES: null
          }, `Salons déverrouillés par ${message.author.tag}`);
          unlockedCount++;
        } catch (error) {
          console.error(`Erreur lors du déverrouillage du salon ${channel.name}:`, error);
          failedCount++;
        }
      }

      message.reply(
        `✅ ${unlockedCount} salon(s) déverrouillé(s).` +
        (failedCount > 0 ? `\n❌ ${failedCount} salon(s) n'ont pas pu être déverrouillé(s).` : '')
      );

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🔓 Salons déverrouillés',
            fields: [
              {
                name: '✅ Salons déverrouillés',
                value: unlockedCount.toString(),
                inline: true
              },
              {
                name: '❌ Échecs',
                value: failedCount.toString(),
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
      console.error('Erreur lors du déverrouillage des salons:', error);
      message.reply('❌ Une erreur est survenue lors du déverrouillage des salons.');
    }
  }
}; 