module.exports = {
  name: 'poll',
  description: 'Crée un sondage',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('Vous n\'avez pas la permission de créer des sondages.');
    }

    if (!args[0]) {
      return message.reply('Veuillez spécifier une question pour le sondage.');
    }

    const question = args.join(' ');
    const reactions = ['👍', '👎', '🤷'];

    const embed = {
      title: '📊 Sondage',
      description: question,
      color: 0x00ff00,
      timestamp: new Date(),
      footer: {
        text: `Créé par ${message.author.tag}`
      }
    };

    const pollMessage = await message.channel.send({ embeds: [embed] });
    await Promise.all(reactions.map(reaction => pollMessage.react(reaction)));

    message.delete().catch(() => {});
  }
}; 