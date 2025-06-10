module.exports = {
  name: 'alldadmins',
  description: 'Affiche la liste des membres (hors bots) ayant la permission administrateur',
  async execute(message, args, client) {
    const admins = message.guild.members.cache.filter(m => !m.user.bot && m.permissions.has('Administrator'));
    if (!admins.size) return message.reply('Aucun administrateur trouvé.');
    message.reply('Membres administrateurs :\n' + admins.map(a => a.user.tag).join('\n'));
  }
}; 