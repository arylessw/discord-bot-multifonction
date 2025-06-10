module.exports = {
  name: 'serververification',
  description: 'Affiche les informations sur la vérification du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('Vous n\'avez pas la permission de voir les informations sur la vérification.');
    }

    try {
      const verificationLevel = {
        0: 'Aucune',
        1: 'Basse',
        2: 'Moyenne',
        3: 'Élevée',
        4: 'Très élevée'
      }[message.guild.verificationLevel];

      const mfaLevel = {
        0: 'Désactivé',
        1: 'Activé'
      }[message.guild.mfaLevel];

      const explicitContentFilter = {
        0: 'Désactivé',
        1: 'Membres sans rôle',
        2: 'Tous les membres'
      }[message.guild.explicitContentFilter];

      const embed = {
        title: `🔒 Vérification de ${message.guild.name}`,
        fields: [
          {
            name: '📝 Niveau de vérification',
            value: verificationLevel,
            inline: true
          },
          {
            name: '🔐 Authentification à deux facteurs',
            value: mfaLevel,
            inline: true
          },
          {
            name: '🚫 Filtre de contenu explicite',
            value: explicitContentFilter,
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des informations sur la vérification.');
    }
  }
}; 