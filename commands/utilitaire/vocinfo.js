module.exports = {
  name: 'vocinfo',
  description: 'Affiche les informations sur les salons vocaux',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const voiceChannels = message.guild.channels.cache.filter(c => c.type === 'GUILD_VOICE');
    if (!voiceChannels.size) {
      return message.reply('Aucun salon vocal trouvé sur ce serveur.');
    }

    const channelList = voiceChannels.map(channel => ({
      name: channel.name,
      id: channel.id,
      members: channel.members.size,
      userLimit: channel.userLimit,
      bitrate: channel.bitrate,
      category: channel.parent ? channel.parent.name : 'Aucune'
    }));

    const embed = {
      title: 'Informations sur les Salons Vocaux',
      description: channelList.map(channel => 
        `**${channel.name}**\n` +
        `ID: ${channel.id}\n` +
        `Membres: ${channel.members}/${channel.userLimit || '∞'}\n` +
        `Bitrate: ${channel.bitrate / 1000}kbps\n` +
        `Catégorie: ${channel.category}\n`
      ).join('\n'),
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 