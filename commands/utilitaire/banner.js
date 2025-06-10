const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'banner',
  description: 'Affiche la bannière d\'un utilisateur',
  async execute(message, args, client) {
    try {
      // Récupérer l'utilisateur mentionné ou l'auteur du message
      let user = message.mentions.users.first() || message.author;
      
      // Si un ID est fourni, essayer de récupérer l'utilisateur
      if (args[0] && !message.mentions.users.first()) {
        try {
          user = await client.users.fetch(args[0]);
        } catch (error) {
          return message.reply('❌ Utilisateur non trouvé.');
        }
      }
      
      // Récupérer les informations complètes de l'utilisateur
      const fetchedUser = await user.fetch(true);
      
      // Vérifier si l'utilisateur a une bannière
      if (!fetchedUser.banner) {
        return message.reply('❌ Cet utilisateur n\'a pas de bannière.');
      }

      // Créer l'embed avec la bannière
      const embed = new MessageEmbed()
        .setTitle(`Bannière de ${fetchedUser.tag}`)
        .setImage(fetchedUser.bannerURL({ dynamic: true, size: 4096 }))
        .setColor(0x00ff00)
        .setTimestamp();

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la récupération de la bannière:', error);
      message.reply('❌ Une erreur est survenue lors de la récupération de la bannière.');
    }
  }
};
