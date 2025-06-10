module.exports = {
  name: 'rolemembers',
  description: 'Affiche la liste des membres ayant un rôle spécifique',
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
    if (!members.size) {
      return message.reply(`Aucun membre n'a le rôle ${role.name}.`);
    }

    const memberList = members.map(member => ({
      name: member.user.tag,
      id: member.user.id,
      joinedAt: member.joinedAt,
      roles: member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.name)
    }));

    const embed = {
      title: `Membres avec le rôle ${role.name}`,
      description: memberList.map(member => 
        `**${member.name}**\n` +
        `ID: ${member.id}\n` +
        `A rejoint le : <t:${Math.floor(member.joinedAt.getTime() / 1000)}:F>\n` +
        `Autres rôles : ${member.roles.join(', ') || 'Aucun'}\n`
      ).join('\n'),
      color: role.color || 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 