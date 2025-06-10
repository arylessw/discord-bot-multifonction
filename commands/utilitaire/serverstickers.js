module.exports = {
  name: 'serverstickers',
  description: 'Affiche la liste des stickers du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    try {
      const stickers = await message.guild.stickers.fetch();
      if (stickers.size === 0) {
        return message.reply('Ce serveur n\'a pas de stickers.');
      }

      const stickerList = stickers.map(sticker => {
        const format = {
          'PNG': 'PNG',
          'APNG': 'APNG',
          'LOTTIE': 'Lottie'
        }[sticker.format];

        return `**${sticker.name}**\n` +
          `ID: ${sticker.id}\n` +
          `Format: ${format}\n` +
          `Tags: ${sticker.tags.join(', ') || 'Aucun'}\n` +
          `URL: [Cliquez ici](${sticker.url})`;
      });

      const embed = {
        title: `🎯 Stickers de ${message.guild.name}`,
        description: stickerList.join('\n\n'),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Total: ${stickers.size} stickers`
        }
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des stickers.');
    }
  }
}; 