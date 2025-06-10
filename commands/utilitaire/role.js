module.exports = {
  name: 'role',
  description: 'Affiche les informations sur un rôle',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!args[0]) {
      return message.reply('Veuillez spécifier un rôle.');
    }

    const roleQuery = args.join(' ');
    const role = message.guild.roles.cache.find(r => 
      r.name.toLowerCase() === roleQuery.toLowerCase() || 
      r.id === roleQuery.replace(/[<@&>]/g, '')
    );

    if (!role) {
      return message.reply('Rôle non trouvé.');
    }

    const members = role.members.filter(member => !member.user.bot);
    const permissions = role.permissions.toArray();

    const embed = {
      title: `Informations sur le rôle ${role.name}`,
      fields: [
        {
          name: 'Informations générales',
          value: `ID: ${role.id}\n` +
            `Couleur: ${role.hexColor}\n` +
            `Position: ${role.position}\n` +
            `Mentionnable: ${role.mentionable ? 'Oui' : 'Non'}\n` +
            `Affiché séparément: ${role.hoist ? 'Oui' : 'Non'}\n` +
            `Créé le: <t:${Math.floor(role.createdTimestamp / 1000)}:F>`,
          inline: true
        },
        {
          name: 'Membres',
          value: `Total: ${members.size}\n` +
            `Humains: ${members.size}\n` +
            `Bots: ${role.members.size - members.size}`,
          inline: true
        },
        {
          name: 'Permissions',
          value: permissions.length > 0 ? permissions.join(', ') : 'Aucune permission spéciale',
          inline: false
        }
      ],
      color: role.color || 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 