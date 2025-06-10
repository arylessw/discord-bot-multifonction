const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'say',
  description: 'Faire parler le bot',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (!args[0]) {
      return message.reply(
        'Commandes disponibles:\n' +
        '`say <message>` - Envoyer un message simple\n' +
        '`say embed <titre> | <description> | <couleur>` - Envoyer un message en embed\n' +
        '`say embed <titre> | <description> | <couleur> | <image>` - Envoyer un message en embed avec une image'
      );
    }

    try {
      if (args[0].toLowerCase() === 'embed') {
        const content = args.slice(1).join(' ');
        const [title, description, color, image] = content.split('|').map(str => str.trim());

        if (!title || !description) {
          return message.reply('Veuillez spécifier un titre et une description.');
        }

        const embed = new MessageEmbed()
          .setTitle(title)
          .setDescription(description)
          .setColor(color || '#00ff00')
          .setFooter({ text: `Demandé par ${message.author.tag}` })
          .setTimestamp();

        if (image) {
          embed.setImage(image);
        }

        message.channel.send({ embeds: [embed] });
      } else {
        const content = args.join(' ');
        message.channel.send(content);
      }

      // Supprimer le message de commande
      message.delete().catch(console.error);
    } catch (error) {
      console.error('Erreur lors de l\'envoi du message:', error);
      message.reply('❌ Une erreur est survenue lors de l\'envoi du message.');
    }
  }
};
