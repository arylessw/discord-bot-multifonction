const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'endgiveaway',
  description: 'Termine un giveaway avec l\'ID de son message',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    if (!args[0]) {
      return message.reply('Veuillez spécifier l\'ID du message du giveaway.');
    }

    try {
      // Récupérer le message du giveaway
      const giveawayMessage = await message.channel.messages.fetch(args[0]);
      if (!giveawayMessage) {
        return message.reply('Message non trouvé.');
      }

      // Vérifier si le message est un giveaway
      if (!giveawayMessage.embeds[0] || !giveawayMessage.embeds[0].title?.includes('GIVEAWAY')) {
        return message.reply('Ce message n\'est pas un giveaway.');
      }

      // Récupérer les réactions
      const reaction = giveawayMessage.reactions.cache.get('🎉');
      if (!reaction) {
        return message.reply('Aucune réaction trouvée sur ce giveaway.');
      }

      // Récupérer les utilisateurs qui ont réagi
      const users = await reaction.users.fetch();
      const validUsers = users.filter(user => !user.bot);

      if (validUsers.size === 0) {
        return message.reply('Aucun participant valide dans ce giveaway.');
      }

      // Sélectionner le(s) gagnant(s)
      const winners = [];
      const winnerCount = 1; // Nombre de gagnants (à adapter selon vos besoins)

      for (let i = 0; i < winnerCount && validUsers.size > 0; i++) {
        const winner = validUsers.random();
        winners.push(winner);
        validUsers.delete(winner.id);
      }

      // Mettre à jour l'embed du giveaway
      const embed = giveawayMessage.embeds[0];
      embed.setTitle('🎉 GIVEAWAY TERMINÉ');
      embed.setDescription(
        `Gagnant(s): ${winners.map(w => w.toString()).join(', ')}\n` +
        `Nombre de participants: ${validUsers.size + winners.length}`
      );
      embed.setColor(0xff0000);
      embed.setFooter({ text: `Terminé par ${message.author.tag}` });

      // Mettre à jour le message
      await giveawayMessage.edit({ embeds: [embed] });

      // Envoyer un message de félicitations
      message.channel.send(
        `🎉 Félicitations ${winners.map(w => w.toString()).join(', ')} !\n` +
        `Vous avez gagné le giveaway !`
      );

      // Envoyer dans le canal de logs si configuré
      const config = require('../../config/server_config.json');
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '🎉 Giveaway terminé',
            fields: [
              {
                name: '📝 Giveaway',
                value: `[Cliquez ici](${giveawayMessage.url})`,
                inline: true
              },
              {
                name: '🏆 Gagnant(s)',
                value: winners.map(w => w.toString()).join('\n'),
                inline: true
              },
              {
                name: '👥 Participants',
                value: `${validUsers.size + winners.length} participant(s)`,
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0xff0000,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la fin du giveaway:', error);
      message.reply('❌ Une erreur est survenue lors de la fin du giveaway.');
    }
  }
}; 