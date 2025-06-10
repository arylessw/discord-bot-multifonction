module.exports = {
  name: 'serverroles',
  description: 'Affiche la liste des rôles du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const roles = message.guild.roles.cache
        .filter(role => role.id !== message.guild.id)
        .sort((a, b) => b.position - a.position);

      if (roles.size === 0) {
        return message.reply('Ce serveur n\'a pas de rôles.');
      }

      const roleList = roles.map(role => {
        const permissions = [];
        if (role.permissions.has('Administrator')) permissions.push('Administrateur');
        if (role.permissions.has('ManageGuild')) permissions.push('Gérer le serveur');
        if (role.permissions.has('ManageRoles')) permissions.push('Gérer les rôles');
        if (role.permissions.has('ManageChannels')) permissions.push('Gérer les salons');
        if (role.permissions.has('KickMembers')) permissions.push('Expulser des membres');
        if (role.permissions.has('BanMembers')) permissions.push('Bannir des membres');
        if (role.permissions.has('ManageMessages')) permissions.push('Gérer les messages');
        if (role.permissions.has('MentionEveryone')) permissions.push('Mentionner @everyone');

        return `**${role.name}**\n` +
          `ID: ${role.id}\n` +
          `Couleur: ${role.hexColor}\n` +
          `Position: ${role.position}\n` +
          `Mentionnable: ${role.mentionable ? 'Oui' : 'Non'}\n` +
          `Affiché séparément: ${role.hoist ? 'Oui' : 'Non'}\n` +
          `Membres: ${role.members.size}\n` +
          `Permissions principales: ${permissions.length > 0 ? permissions.join(', ') : 'Aucune'}`;
      });

      const embed = {
        title: `👥 Rôles de ${message.guild.name}`,
        description: roleList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${roles.size} rôles`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur serverroles:', error);
      message.reply('Une erreur est survenue lors de la récupération des rôles.');
    }
  }
}; 