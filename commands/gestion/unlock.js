const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'unlock',
  description: 'Déverrouiller un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const channel = message.mentions.channels.first() || message.channel;

    try {
      await channel.permissionOverwrites.edit(message.guild.roles.everyone, {
        SEND_MESSAGES: null
      }, `Salon déverrouillé par ${message.author.tag}`);

      message.reply(`✅ Le salon ${channel} a été déverrouillé.`);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🔓 Salon déverrouillé',
            fields: [
              {
                name: '📌 Canal',
                value: channel.toString(),
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
      console.error('Erreur lors du déverrouillage du salon:', error);
      message.reply('❌ Une erreur est survenue lors du déverrouillage du salon.');
    }
  }
}; 