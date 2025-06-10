const { MessageEmbed } = require('discord.js');

module.exports = {
  name: 'snipe',
  description: 'Affiche le dernier message supprimé',
  async execute(message, args, client) {
    try {
      // Vérifier si la commande est utilisée dans un serveur
      if (!message.guild) {
        return message.reply('❌ Cette commande doit être utilisée dans un serveur.');
      }

      // Récupérer le dernier message supprimé
      const snipe = client.snipes.get(message.channel.id);
      if (!snipe) {
        return message.reply('❌ Aucun message supprimé récemment dans ce canal.');
      }

      // Créer l'embed avec le message supprimé
      const embed = new MessageEmbed()
        .setTitle('🔍 Message supprimé')
        .setDescription(snipe.content)
        .addField('Auteur', `<@${snipe.author}>`, true)
        .addField('Supprimé le', `<t:${Math.floor(snipe.timestamp / 1000)}:R>`, true)
        .setColor(0x00ff00)
        .setTimestamp();

      // Ajouter l'image si le message en contenait une
      if (snipe.image) {
        embed.setImage(snipe.image);
      }

      message.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Erreur lors de la récupération du message supprimé:', error);
      message.reply('❌ Une erreur est survenue lors de la récupération du message supprimé.');
    }
  }
};
