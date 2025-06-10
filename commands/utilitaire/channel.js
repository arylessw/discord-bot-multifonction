module.exports = {
  name: 'channel',
  description: 'Affiche les informations sur un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const channelQuery = args.join(' ') || message.channel.id;
    const channel = message.guild.channels.cache.find(c => 
      c.name.toLowerCase() === channelQuery.toLowerCase() || 
      c.id === channelQuery.replace(/[<#>]/g, '')
    );

    if (!channel) {
      return message.reply('Salon non trouvé.');
    }

    const embed = {
      title: `Informations sur le salon ${channel.name}`,
      fields: [
        {
          name: 'Informations générales',
          value: `ID: ${channel.id}\n` +
            `Type: ${channel.type}\n` +
            `Catégorie: ${channel.parent ? channel.parent.name : 'Aucune'}\n` +
            `Créé le: <t:${Math.floor(channel.createdTimestamp / 1000)}:F>`,
          inline: true
        }
      ],
      color: 0x00ff00,
      timestamp: new Date()
    };

    if (channel.type === 'GUILD_TEXT') {
      embed.fields.push(
        {
          name: 'Paramètres',
          value: `NSFW: ${channel.nsfw ? 'Oui' : 'Non'}\n` +
            `Slowmode: ${channel.rateLimitPerUser}s\n` +
            `Topic: ${channel.topic || 'Aucun'}`,
          inline: true
        }
      );
    } else if (channel.type === 'GUILD_VOICE') {
      embed.fields.push(
        {
          name: 'Paramètres',
          value: `Limite d'utilisateurs: ${channel.userLimit || 'Aucune'}\n` +
            `Bitrate: ${channel.bitrate / 1000}kbps\n` +
            `Membres: ${channel.members.size}`,
          inline: true
        }
      );
    }

    message.reply({ embeds: [embed] });
  }
}; 