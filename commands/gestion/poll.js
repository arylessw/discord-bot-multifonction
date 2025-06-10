const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'poll',
  description: 'Créer un sondage',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (args.length < 2) {
      return message.reply(
        'Veuillez spécifier une question et au moins une option.\n' +
        'Utilisation: `!poll "Question" "Option 1" "Option 2" [Option 3] [Option 4]`'
      );
    }

    try {
      // Extraire la question et les options
      const question = args[0].replace(/^"|"$/g, '');
      const options = args.slice(1).map(opt => opt.replace(/^"|"$/g, ''));

      if (options.length < 2 || options.length > 10) {
        return message.reply('Le sondage doit contenir entre 2 et 10 options.');
      }

      // Créer l'embed du sondage
      const embed = new MessageEmbed()
        .setTitle('📊 Sondage')
        .setDescription(question)
        .setColor(0x00ff00)
        .setTimestamp()
        .setFooter({ text: `Créé par ${message.author.tag}` });

      // Ajouter les options avec des émojis numériques
      const emojis = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
      options.forEach((option, index) => {
        embed.addField(`${emojis[index]} ${option}`, '0 vote', true);
      });

      // Envoyer le sondage
      const pollMessage = await message.channel.send({ embeds: [embed] });

      // Ajouter les réactions
      for (let i = 0; i < options.length; i++) {
        await pollMessage.react(emojis[i]);
      }

      // Supprimer le message de commande
      message.delete().catch(console.error);

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '📊 Sondage créé',
            fields: [
              {
                name: '📌 Question',
                value: question,
                inline: false
              },
              {
                name: '📝 Options',
                value: options.map((opt, i) => `${emojis[i]} ${opt}`).join('\n'),
                inline: false
              },
              {
                name: '👮 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0x00ff00,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la création du sondage:', error);
      message.reply('❌ Une erreur est survenue lors de la création du sondage.');
    }
  }
}; 