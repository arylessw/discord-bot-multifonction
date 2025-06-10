const { MessageActionRow, MessageButton } = require('discord.js');

module.exports = {
  name: 'button',
  description: 'Ajouter/supprimer un bouton personnalisé sur un message du bot',
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
        '`button add <id_message> <label> <style> <custom_id>` - Ajouter un bouton\n' +
        '`button remove <id_message> <custom_id>` - Supprimer un bouton\n' +
        '`button list <id_message>` - Voir la liste des boutons\n\n' +
        'Styles disponibles:\n' +
        '- PRIMARY (bleu)\n' +
        '- SECONDARY (gris)\n' +
        '- SUCCESS (vert)\n' +
        '- DANGER (rouge)\n' +
        '- LINK (lien)\n\n' +
        'Exemple: `button add 1234567890 Mon Bouton PRIMARY mon_bouton`'
      );
    }

    const subCommand = args[0].toLowerCase();
    const messageId = args[1];

    if (!messageId) {
      return message.reply('Veuillez spécifier l\'ID du message.');
    }

    try {
      const targetMessage = await message.channel.messages.fetch(messageId);
      if (!targetMessage) {
        return message.reply('Message non trouvé.');
      }

      if (targetMessage.author.id !== client.user.id) {
        return message.reply('Le message doit être un message du bot.');
      }

      switch (subCommand) {
        case 'add': {
          const label = args[2];
          const style = args[3]?.toUpperCase();
          const customId = args[4];

          if (!label || !style || !customId) {
            return message.reply('Veuillez spécifier le label, le style et l\'ID personnalisé du bouton.');
          }

          if (!['PRIMARY', 'SECONDARY', 'SUCCESS', 'DANGER', 'LINK'].includes(style)) {
            return message.reply('Style de bouton invalide. Utilisez la commande sans arguments pour voir les styles disponibles.');
          }

          const button = new MessageButton()
            .setCustomId(customId)
            .setLabel(label)
            .setStyle(style);

          if (style === 'LINK') {
            const url = args[5];
            if (!url) {
              return message.reply('Veuillez spécifier une URL pour le bouton de type LINK.');
            }
            button.setURL(url);
          }

          let row;
          if (targetMessage.components.length > 0) {
            row = targetMessage.components[0];
            if (row.components.length >= 5) {
              return message.reply('Le message a déjà atteint la limite de 5 boutons par ligne.');
            }
            row.addComponents(button);
          } else {
            row = new MessageActionRow().addComponents(button);
          }

          await targetMessage.edit({ components: [row] });
          message.reply(`✅ Le bouton "${label}" a été ajouté avec succès.`);
          break;
        }

        case 'remove': {
          const customId = args[2];
          if (!customId) {
            return message.reply('Veuillez spécifier l\'ID personnalisé du bouton à supprimer.');
          }

          if (!targetMessage.components.length) {
            return message.reply('Ce message n\'a pas de boutons.');
          }

          const row = targetMessage.components[0];
          const buttonIndex = row.components.findIndex(button => button.customId === customId);

          if (buttonIndex === -1) {
            return message.reply('Bouton non trouvé.');
          }

          row.spliceComponents(buttonIndex, 1);

          if (row.components.length === 0) {
            await targetMessage.edit({ components: [] });
          } else {
            await targetMessage.edit({ components: [row] });
          }

          message.reply('✅ Le bouton a été supprimé avec succès.');
          break;
        }

        case 'list': {
          if (!targetMessage.components.length) {
            return message.reply('Ce message n\'a pas de boutons.');
          }

          const row = targetMessage.components[0];
          let response = 'Liste des boutons:\n';
          row.components.forEach(button => {
            response += `- Label: ${button.label}\n`;
            response += `  ID: ${button.customId}\n`;
            response += `  Style: ${button.style}\n`;
            if (button.style === 'LINK') {
              response += `  URL: ${button.url}\n`;
            }
            response += '\n';
          });

          message.reply(response);
          break;
        }

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des boutons:', error);
      message.reply('❌ Une erreur est survenue lors de la gestion des boutons.');
    }
  }
}; 