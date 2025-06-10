module.exports = {
  name: 'serverbanner',
  description: 'Affiche la bannière du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const bannerURL = message.guild.bannerURL({ dynamic: true, size: 4096 });
    if (!bannerURL) {
      return message.reply('Ce serveur n\'a pas de bannière.');
    }

    const embed = {
      title: `Bannière de ${message.guild.name}`,
      image: {
        url: bannerURL
      },
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
};
