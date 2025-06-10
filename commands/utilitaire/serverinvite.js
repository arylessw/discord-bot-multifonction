module.exports = {
  name: 'serverinvite',
  description: 'Génère un lien d\'invitation permanent',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('CREATE_INSTANT_INVITE')) {
      return message.reply('Vous n\'avez pas la permission de créer des invitations.');
    }

    try {
      const invite = await message.channel.createInvite({
        maxAge: 0,
        maxUses: 0,
        unique: true
      });

      const embed = {
        title: 'Lien d\'invitation permanent',
        description: `[Cliquez ici pour inviter des membres](${invite.url})`,
        fields: [
          {
            name: 'Informations',
            value: `**Salon:** ${message.channel.name}\n**Créé par:** ${message.author.tag}\n**Expiration:** Jamais\n**Utilisations:** Illimitées`,
            inline: false
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la création de l\'invitation.');
    }
  }
}; 