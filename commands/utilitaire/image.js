const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: 'image',
  description: 'Recherche une image sur Google',
  async execute(message, args, client) {
    try {
      // Vérifier si une recherche a été fournie
      if (!args[0]) {
        return message.reply('❌ Veuillez fournir un terme de recherche.');
      }

      // Construire l'URL de recherche
      const searchQuery = args.join(' ');
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_SEARCH_ENGINE_ID}&q=${encodeURIComponent(searchQuery)}&searchType=image`;

      // Effectuer la recherche
      const response = await fetch(searchUrl);
      const data = await response.json();

      // Vérifier si des résultats ont été trouvés
      if (!data.items || data.items.length === 0) {
        return message.reply('❌ Aucune image trouvée pour cette recherche.');
      }

      // Sélectionner une image aléatoire parmi les résultats
      const randomImage = data.items[Math.floor(Math.random() * data.items.length)];

      // Créer l'embed avec l'image
      const embed = new MessageEmbed()
        .setTitle(`Image pour "${searchQuery}"`)
        .setImage(randomImage.link)
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la recherche d\'image:', error);
      message.reply('❌ Une erreur est survenue lors de la recherche d\'image.');
    }
  }
};
