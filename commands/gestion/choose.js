module.exports = {
  name: 'choose',
  description: 'Lance un tirage au sort instantané sur un message',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!args[0]) {
      return message.reply(
        'Veuillez spécifier un message à réagir.\n' +
        'Utilisation: `choose <message_id> [nombre_de_gagnants]`'
      );
    }

    const messageId = args[0];
    const winnersCount = parseInt(args[1]) || 1;

    if (isNaN(winnersCount) || winnersCount < 1) {
      return message.reply('Le nombre de gagnants doit être un nombre positif.');
    }

    try {
      // Récupérer le message
      const targetMessage = await message.channel.messages.fetch(messageId);
      if (!targetMessage) {
        return message.reply('Message non trouvé.');
      }

      // Récupérer les réactions
      const reactions = targetMessage.reactions.cache;
      if (reactions.size === 0) {
        return message.reply('Aucune réaction trouvée sur ce message.');
      }

      // Collecter tous les utilisateurs qui ont réagi
      const users = new Set();
      for (const reaction of reactions.values()) {
        const fetchedUsers = await reaction.users.fetch();
        fetchedUsers.forEach(user => {
          if (!user.bot) users.add(user);
        });
      }

      if (users.size === 0) {
        return message.reply('Aucun utilisateur n\'a réagi à ce message.');
      }

      if (users.size < winnersCount) {
        return message.reply(`Il n'y a que ${users.size} participant(s), impossible de tirer ${winnersCount} gagnant(s).`);
      }

      // Convertir en tableau et mélanger
      const participants = Array.from(users);
      for (let i = participants.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [participants[i], participants[j]] = [participants[j], participants[i]];
      }

      // Sélectionner les gagnants
      const winners = participants.slice(0, winnersCount);

      // Créer l'embed de résultat
      const embed = {
        title: '🎉 Résultat du tirage au sort',
        description: `Message: [Cliquez ici](${targetMessage.url})`,
        fields: [
          {
            name: '👥 Participants',
            value: `${participants.length} participant(s)`,
            inline: true
          },
          {
            name: '🏆 Gagnant(s)',
            value: winners.map(w => w.toString()).join('\n'),
            inline: true
          }
        ],
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🎲 Tirage au sort effectué',
            fields: [
              {
                name: '📝 Message',
                value: `[Cliquez ici](${targetMessage.url})`,
                inline: true
              },
              {
                name: '👥 Participants',
                value: `${participants.length} participant(s)`,
                inline: true
              },
              {
                name: '🏆 Gagnant(s)',
                value: winners.map(w => w.toString()).join('\n'),
                inline: true
              },
              {
                name: '👤 Modérateur',
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
      console.error('Erreur lors du tirage au sort:', error);
      message.reply('❌ Une erreur est survenue lors du tirage au sort.');
    }
  }
}; 