module.exports = {
  name: 'invite',
  description: 'Génère un lien d\'invitation',
  async execute(message, args, client) {
    const invite = await message.channel.createInvite({
      maxAge: 0,
      maxUses: 0,
      unique: true
    });

    const embed = {
      title: 'Lien d\'invitation',
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
  }
}; 