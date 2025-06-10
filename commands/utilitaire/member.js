module.exports = {
  name: 'member',
  description: 'Affiche les informations relatives à un membre sur le serveur',
  async execute(message, args, client) {
    let member;
    if (!args.length) {
      member = message.member;
    } else {
      const mention = args[0].replace(/[<@!>]/g, '');
      member = message.guild.members.cache.get(mention) || message.guild.members.cache.find(m => m.user.tag === args.join(' '));
    }
    if (!member) return message.reply('Membre introuvable.');
    const roles = member.roles.cache.filter(r => r.id !== message.guild.id).map(r => r.name).join(', ') || 'Aucun';
    const info = `Pseudo : ${member.user.tag}\nID : ${member.id}\nRôles : ${roles}\nA rejoint le serveur le : ${member.joinedAt ? member.joinedAt.toLocaleDateString() : 'Inconnu'}`;
    message.reply(info);
  }
}; 