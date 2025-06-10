module.exports = {
  name: 'pic',
  description: 'Permet de récupérer la photo de profil de quelqu\'un',
  async execute(message, args, client) {
    let member;
    if (!args.length) {
      member = message.member;
    } else {
      const mention = args[0].replace(/[<@!>]/g, '');
      member = message.guild.members.cache.get(mention) || message.guild.members.cache.find(m => m.user.tag === args.join(' '));
    }
    if (!member) return message.reply('Membre introuvable.');
    message.reply(member.user.displayAvatarURL({ dynamic: true, size: 512 }));
  }
}; 