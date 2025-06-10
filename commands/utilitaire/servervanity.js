module.exports = {
  name: 'servervanity',
  description: 'Affiche les informations sur l\'URL personnalisée du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('Vous n\'avez pas la permission de voir les informations sur l\'URL personnalisée.');
    }

    try {
      const vanity = await message.guild.fetchVanityData();
      if (!vanity) {
        return message.reply('Ce serveur n\'a pas d\'URL personnalisée.');
      }

      const embed = {
        title: `🔗 URL personnalisée de ${message.guild.name}`,
        fields: [
          {
            name: 'URL',
            value: `discord.gg/${vanity.code}`,
            inline: true
          },
          {
            name: 'Utilisations',
            value: vanity.uses.toString(),
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      if (error.code === 50001) {
        message.reply('Ce serveur n\'a pas d\'URL personnalisée.');
      } else {
        message.reply('Une erreur est survenue lors de la récupération des informations sur l\'URL personnalisée.');
      }
    }
  }
}; 