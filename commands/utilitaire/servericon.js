module.exports = {
  name: 'servericon',
  description: 'Affiche l\'icône du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const iconURL = message.guild.iconURL({ dynamic: true, size: 4096 });
    if (!iconURL) {
      return message.reply('Ce serveur n\'a pas d\'icône.');
    }

    const embed = {
      title: `Icône de ${message.guild.name}`,
      image: {
        url: iconURL
      },
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 