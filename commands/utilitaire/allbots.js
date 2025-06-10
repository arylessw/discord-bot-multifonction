module.exports = {
  name: 'allbots',
  description: 'Affiche la liste des bots sur le serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const bots = message.guild.members.cache.filter(member => member.user.bot);
    if (!bots.size) {
      return message.reply('Aucun bot trouvé sur ce serveur.');
    }

    const botList = bots.map(bot => ({
      name: bot.user.tag,
      id: bot.user.id,
      joinedAt: bot.joinedAt
    }));

    const embed = {
      title: 'Liste des Bots',
      description: botList.map(bot => 
        `**${bot.name}**\n` +
        `ID: ${bot.id}\n` +
        `A rejoint le : <t:${Math.floor(bot.joinedAt.getTime() / 1000)}:F>\n`
      ).join('\n'),
      color: 0x00ff00,
      timestamp: new Date()
    };

    message.reply({ embeds: [embed] });
  }
}; 