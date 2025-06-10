module.exports = {
  name: 'serverinvites',
  description: 'Affiche la liste des invitations du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MANAGE_GUILD')) {
      return message.reply('Vous n\'avez pas la permission de voir la liste des invitations.');
    }

    try {
      const invites = await message.guild.invites.fetch();
      if (invites.size === 0) {
        return message.reply('Ce serveur n\'a pas d\'invitations.');
      }

      const inviteList = invites.map(invite => {
        const uses = invite.uses || 0;
        const maxUses = invite.maxUses || 'Illimité';
        const expiresAt = invite.expiresAt ? new Date(invite.expiresAt).toLocaleString() : 'Jamais';
        
        return `**Code: ${invite.code}**\n` +
          `Créé par: ${invite.inviter?.tag || 'Inconnu'}\n` +
          `Utilisations: ${uses}/${maxUses}\n` +
          `Expire le: ${expiresAt}`;
      });

      const embed = {
        title: `📨 Invitations de ${message.guild.name}`,
        description: inviteList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${invites.size} invitations`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des invitations.');
    }
  }
}; 