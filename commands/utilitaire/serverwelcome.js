module.exports = {
  name: 'serverwelcome',
  description: 'Affiche les informations sur le message de bienvenue du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('Vous n\'avez pas la permission de voir les informations sur le message de bienvenue.');
    }

    try {
      const welcomeChannel = message.guild.systemChannel;
      const welcomeMessage = message.guild.systemChannelFlags.has('SUPPRESS_WELCOME_MESSAGE') ? 'Désactivé' : 'Activé';
      const boostMessage = message.guild.systemChannelFlags.has('SUPPRESS_BOOST_MESSAGE') ? 'Désactivé' : 'Activé';
      const joinMessage = message.guild.systemChannelFlags.has('SUPPRESS_JOIN_NOTIFICATIONS') ? 'Désactivé' : 'Activé';

      const embed = {
        title: `👋 Message de bienvenue de ${message.guild.name}`,
        fields: [
          {
            name: '📝 Salon système',
            value: welcomeChannel ? welcomeChannel.toString() : 'Aucun',
            inline: true
          },
          {
            name: '🎉 Message de bienvenue',
            value: welcomeMessage,
            inline: true
          },
          {
            name: '🚀 Message de boost',
            value: boostMessage,
            inline: true
          },
          {
            name: '📥 Message de join',
            value: joinMessage,
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des informations sur le message de bienvenue.');
    }
  }
}; 