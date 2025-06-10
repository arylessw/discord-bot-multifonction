const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'emoji',
  description: 'Affiche des informations sur un emoji',
  async execute(message, args, client) {
    try {
      // Vérifier si un emoji a été fourni
      if (!args[0]) {
        return message.reply('❌ Veuillez fournir un emoji.');
      }

      // Récupérer l'emoji
      const emoji = args[0];
      
      // Vérifier si c'est un emoji personnalisé
      const customEmoji = emoji.match(/<a?:.+?:\d+>/);
      if (customEmoji) {
        const emojiId = emoji.match(/\d+/)[0];
        const emojiName = emoji.match(/:([^:]+):/)[1];
        const isAnimated = emoji.startsWith('<a:');
        
        const embed = new MessageEmbed()
          .setTitle('Emoji personnalisé')
          .addField('Nom', emojiName, true)
          .addField('ID', emojiId, true)
          .addField('Animé', isAnimated ? '✅' : '❌', true)
          .addField('URL', `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`)
          .setImage(`https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`)
          .setColor(0x00ff00)
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      // Vérifier si c'est un emoji Unicode
      if (emoji.match(/[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{25c0}\u{23eb}]/u)) {
        const embed = new MessageEmbed()
          .setTitle('Emoji Unicode')
          .addField('Emoji', emoji)
          .addField('Code', emoji.codePointAt(0).toString(16))
          .setColor(0x00ff00)
          .setTimestamp();

        return message.reply({ embeds: [embed] });
      }

      message.reply('❌ Emoji invalide.');
    } catch (error) {
      console.error('Erreur lors de la récupération des informations de l\'emoji:', error);
      message.reply('❌ Une erreur est survenue lors de la récupération des informations de l\'emoji.');
    }
  }
};
