module.exports = {
  name: 'boosters',
  description: 'Affiche la liste des membres boostant le serveur',
  async execute(message, args, client) {
    const boosters = message.guild.members.cache.filter(m => m.premiumSince);
    if (!boosters.size) return message.reply('Aucun booster trouvé.');
    message.reply('Boosters du serveur :\n' + boosters.map(b => b.user.tag).join('\n'));
  }
}; 