module.exports = {
  name: 'user',
  description: 'Affiche les informations relatives à un utilisateur',
  async execute(message, args, client) {
    let member;
    if (!args.length) {
      member = message.member;
    } else {
      const mention = args[0].replace(/[<@!>]/g, '');
      member = message.guild.members.cache.get(mention) || message.guild.members.cache.find(m => m.user.tag === args.join(' '));
    }
    if (!member) return message.reply('Utilisateur introuvable.');
    const info = `Pseudo : ${member.user.tag}\nID : ${member.id}\nCréé le : ${member.user.createdAt.toLocaleDateString()}\nA rejoint le serveur le : ${member.joinedAt ? member.joinedAt.toLocaleDateString() : 'Inconnu'}`;
    message.reply(info);
  }
}; 