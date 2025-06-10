module.exports = {
  name: 'channelinfo',
  description: 'Affiche les informations détaillées d\'un salon',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const channel = message.mentions.channels.first() || 
      message.guild.channels.cache.get(args[0]) ||
      message.guild.channels.cache.find(c => c.name.toLowerCase() === args.join(' ').toLowerCase()) ||
      message.channel;

    const type = {
      0: 'Textuel',
      2: 'Vocal',
      4: 'Catégorie',
      5: 'Annonces',
      13: 'Stage',
      15: 'Forum',
      16: 'Media'
    }[channel.type] || 'Inconnu';

    const nsfw = channel.nsfw ? 'Oui' : 'Non';
    const parent = channel.parent ? channel.parent.name : 'Aucune';
    const position = channel.position;
    const created = `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`;

    let topic = channel.topic || 'Aucun';
    if (topic.length > 1024) {
      topic = topic.substring(0, 1021) + '...';
    }

    let rateLimit = 'Aucun';
    if (channel.type === 0 && channel.rateLimitPerUser > 0) {
      rateLimit = `${channel.rateLimitPerUser} seconde(s)`;
    }

    let bitrate = 'N/A';
    if (channel.type === 2) {
      bitrate = `${channel.bitrate / 1000}kbps`;
    }

    let userLimit = 'N/A';
    if (channel.type === 2) {
      userLimit = channel.userLimit ? channel.userLimit : 'Illimité';
    }

    const embed = {
      title: `Informations sur le salon ${channel.name}`,
      fields: [
        {
          name: '👤 Informations générales',
          value: `**ID:** ${channel.id}\n**Type:** ${type}\n**Catégorie:** ${parent}\n**Position:** ${position}\n**Créé le:** ${created}`,
          inline: false
        }
      ],
      color: 0x00ff00,
      timestamp: new Date()
    };

    if (channel.type === 0) {
      embed.fields.push({
        name: '📝 Détails',
        value: `**NSFW:** ${nsfw}\n**Slowmode:** ${rateLimit}\n**Sujet:** ${topic}`,
        inline: false
      });
    } else if (channel.type === 2) {
      embed.fields.push({
        name: '🎙️ Détails',
        value: `**Bitrate:** ${bitrate}\n**Limite d'utilisateurs:** ${userLimit}`,
        inline: false
      });
    }

    message.reply({ embeds: [embed] });
  }
}; 