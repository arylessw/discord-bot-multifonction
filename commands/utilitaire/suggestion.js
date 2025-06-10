const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'suggestion',
  description: 'Fait une suggestion pour le serveur',
  async execute(message, args, client) {
    try {
      // Vérifier si la commande est utilisée dans un serveur
      if (!message.guild) {
        return message.reply('❌ Cette commande doit être utilisée dans un serveur.');
      }

      // Vérifier si une suggestion a été fournie
      if (!args[0]) {
        return message.reply('❌ Veuillez fournir une suggestion.');
      }

      // Lire le fichier de suggestions
      const suggestionsPath = path.join(__dirname, '../../config/suggestions.json');
      let suggestions = {};
      
      if (fs.existsSync(suggestionsPath)) {
        suggestions = JSON.parse(fs.readFileSync(suggestionsPath, 'utf8'));
      }

      // Initialiser les suggestions pour ce serveur si nécessaire
      if (!suggestions[message.guild.id]) {
        suggestions[message.guild.id] = {};
      }

      // Générer un ID unique pour la suggestion
      const suggestionId = Object.keys(suggestions[message.guild.id]).length + 1;

      // Créer la suggestion
      suggestions[message.guild.id][suggestionId] = {
        author: message.author.id,
        content: args.join(' '),
        timestamp: Date.now(),
        status: 'En attente',
        upvotes: 0,
        downvotes: 0
      };

      // Sauvegarder les suggestions
      fs.writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));

      // Créer l'embed de la suggestion
      const embed = new MessageEmbed()
        .setTitle('📝 Nouvelle suggestion')
        .setDescription(args.join(' '))
        .addField('Auteur', message.author.toString(), true)
        .addField('ID', `#${suggestionId}`, true)
        .addField('Status', '⏳ En attente', true)
        .setColor(0x00ff00)
        .setTimestamp();

      // Envoyer la suggestion et ajouter les réactions
      const suggestionMessage = await message.reply({ embeds: [embed] });
      await suggestionMessage.react('👍');
      await suggestionMessage.react('👎');

      // Créer le collecteur de réactions
      const filter = (reaction, user) => ['👍', '👎'].includes(reaction.emoji.name) && !user.bot;
      const collector = suggestionMessage.createReactionCollector({ filter });

      collector.on('collect', async (reaction, user) => {
        // Mettre à jour les votes
        if (reaction.emoji.name === '👍') {
          suggestions[message.guild.id][suggestionId].upvotes++;
        } else {
          suggestions[message.guild.id][suggestionId].downvotes++;
        }

        // Sauvegarder les suggestions
        fs.writeFileSync(suggestionsPath, JSON.stringify(suggestions, null, 2));

        // Mettre à jour l'embed
        embed.fields[2].value = `👍 ${suggestions[message.guild.id][suggestionId].upvotes} | 👎 ${suggestions[message.guild.id][suggestionId].downvotes}`;
        await suggestionMessage.edit({ embeds: [embed] });
      });
    } catch (error) {
      console.error('Erreur lors de la création de la suggestion:', error);
      message.reply('❌ Une erreur est survenue lors de la création de la suggestion.');
    }
  }
};
