const { MessageEmbed } = require('discord.js');
const fetch = require('node-fetch');

module.exports = {
  name: 'searchwiki',
  description: 'Recherche un article sur Wikipédia',
  async execute(message, args, client) {
    try {
      // Vérifier si une recherche a été fournie
      if (!args[0]) {
        return message.reply('❌ Veuillez fournir un terme de recherche.');
      }

      // Construire l'URL de recherche
      const searchQuery = args.join(' ');
      const searchUrl = `https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(searchQuery)}&format=json&utf8=1`;

      // Effectuer la recherche
      const response = await fetch(searchUrl);
      const data = await response.json();

      // Vérifier si des résultats ont été trouvés
      if (!data.query.search || data.query.search.length === 0) {
        return message.reply('❌ Aucun article trouvé pour cette recherche.');
      }

      // Récupérer le premier résultat
      const result = data.query.search[0];
      const pageUrl = `https://fr.wikipedia.org/?curid=${result.pageid}`;

      // Créer l'embed avec le résultat
      const embed = new MessageEmbed()
        .setTitle(result.title)
        .setURL(pageUrl)
        .setDescription(result.snippet.replace(/<\/?[^>]+(>|$)/g, ''))
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la recherche Wikipédia:', error);
      message.reply('❌ Une erreur est survenue lors de la recherche Wikipédia.');
    }
  }
};
