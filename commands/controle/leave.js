const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'leave',
  description: 'Fait quitter le bot d\'un serveur',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    const confirmEmbed = {
      title: 'Confirmation',
      description: `Êtes-vous sûr de vouloir faire quitter le bot du serveur ${message.guild.name} ?`,
      color: 0xff0000,
      timestamp: new Date()
    };

    const confirmMessage = await message.reply({ embeds: [confirmEmbed] });
    await confirmMessage.react('✅');
    await confirmMessage.react('❌');

    const filter = (reaction, user) => ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;
    const collected = await confirmMessage.awaitReactions({ filter, max: 1, time: 30000 });

    const reaction = collected.first();
    if (!reaction || reaction.emoji.name === '❌') {
      return message.reply('Commande annulée.');
    }

    await message.guild.leave();
    message.reply(`Le bot a quitté le serveur ${message.guild.name}.`);
  }
}; 