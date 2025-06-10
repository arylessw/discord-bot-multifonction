const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'lbsuggestions',
  description: 'Liste les suggestions du serveur',
  async execute(message, args, client) {
    try {
      // Vérifier si la commande est utilisée dans un serveur
      if (!message.guild) {
        return message.reply('❌ Cette commande doit être utilisée dans un serveur.');
      }

      // Lire le fichier de suggestions
      const suggestionsPath = path.join(__dirname, '../../config/suggestions.json');
      let suggestions = {};
      
      if (fs.existsSync(suggestionsPath)) {
        suggestions = JSON.parse(fs.readFileSync(suggestionsPath, 'utf8'));
      }

      // Vérifier s'il y a des suggestions pour ce serveur
      if (!suggestions[message.guild.id] || Object.keys(suggestions[message.guild.id]).length === 0) {
        return message.reply('❌ Aucune suggestion n\'a été faite sur ce serveur.');
      }

      // Convertir les suggestions en tableau et les trier par ID
      const suggestionsArray = Object.entries(suggestions[message.guild.id])
        .map(([id, suggestion]) => ({ id, ...suggestion }))
        .sort((a, b) => parseInt(a.id) - parseInt(b.id));

      // Nombre de suggestions par page
      const suggestionsPerPage = 5;
      const totalPages = Math.ceil(suggestionsArray.length / suggestionsPerPage);

      // Fonction pour créer l'embed d'une page
      const createEmbed = (page) => {
        const start = (page - 1) * suggestionsPerPage;
        const end = start + suggestionsPerPage;
        const pageSuggestions = suggestionsArray.slice(start, end);

        const embed = new MessageEmbed()
          .setTitle('📝 Suggestions')
          .setDescription(`Page ${page}/${totalPages}`)
          .setColor(0x00ff00)
          .setTimestamp();

        for (const suggestion of pageSuggestions) {
          const user = client.users.cache.get(suggestion.author);
          const status = suggestion.status || 'En attente';
          const statusEmoji = {
            'En attente': '⏳',
            'Approuvée': '✅',
            'Refusée': '❌',
            'Implémentée': '✨'
          }[status] || '⏳';

          embed.addField(
            `${statusEmoji} Suggestion #${suggestion.id}`,
            `**Auteur:** ${user ? user.tag : 'Inconnu'}\n**Suggestion:** ${suggestion.content}\n**Status:** ${status}\n**Votes:** 👍 ${suggestion.upvotes || 0} | 👎 ${suggestion.downvotes || 0}`
          );
        }

        return embed;
      };

      // Envoyer la première page
      let currentPage = 1;
      const message = await message.channel.send({ embeds: [createEmbed(currentPage)] });

      // Ajouter les réactions de navigation
      if (totalPages > 1) {
        await message.react('⬅️');
        await message.react('➡️');

        // Créer le collecteur de réactions
        const filter = (reaction, user) => ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;
        const collector = message.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', async (reaction, user) => {
          if (reaction.emoji.name === '⬅️' && currentPage > 1) {
            currentPage--;
          } else if (reaction.emoji.name === '➡️' && currentPage < totalPages) {
            currentPage++;
          }

          await message.edit({ embeds: [createEmbed(currentPage)] });
          await reaction.users.remove(user.id);
        });

        collector.on('end', () => {
          message.reactions.removeAll();
        });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des suggestions:', error);
      message.reply('❌ Une erreur est survenue lors de la récupération des suggestions.');
    }
  }
};
