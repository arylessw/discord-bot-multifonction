module.exports = {
  name: 'serveremojis',
  description: 'Affiche la liste des emojis du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const emojis = message.guild.emojis.cache;
      if (emojis.size === 0) {
        return message.reply('Ce serveur n\'a pas d\'emojis.');
      }

      const animatedEmojis = emojis.filter(emoji => emoji.animated);
      const staticEmojis = emojis.filter(emoji => !emoji.animated);

      const embed = {
        title: `😀 Emojis de ${message.guild.name}`,
        fields: [
          {
            name: '📊 Statistiques',
            value: `Total: ${emojis.size}\nAnimés: ${animatedEmojis.size}\nStatiques: ${staticEmojis.size}`,
            inline: true
          },
          {
            name: '🎬 Emojis animés',
            value: animatedEmojis.size > 0 
              ? animatedEmojis.map(emoji => emoji.toString()).join(' ')
              : 'Aucun emoji animé',
            inline: false
          },
          {
            name: '🖼️ Emojis statiques',
            value: staticEmojis.size > 0
              ? staticEmojis.map(emoji => emoji.toString()).join(' ')
              : 'Aucun emoji statique',
            inline: false
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des emojis.');
    }
  }
}; 