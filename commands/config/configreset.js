const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'configreset',
  description: 'Réinitialise la configuration du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const configDir = path.join(__dirname, '../../config');
    const configFile = path.join(configDir, 'server_config.json');

    try {
      // Vérifier si la configuration existe
      if (!fs.existsSync(configFile)) {
        return message.reply('Aucune configuration n\'existe pour ce serveur.');
      }

      // Charger la configuration
      const config = JSON.parse(fs.readFileSync(configFile, 'utf8'));

      // Vérifier si le serveur a une configuration
      if (!config[message.guild.id]) {
        return message.reply('Aucune configuration n\'existe pour ce serveur.');
      }

      // Demander confirmation
      const confirmMessage = await message.reply({
        embeds: [{
          title: '⚠️ Confirmation de réinitialisation',
          description: 'Êtes-vous sûr de vouloir réinitialiser la configuration du serveur ?\n' +
                      'Cette action est irréversible et supprimera tous les paramètres actuels.',
          color: 0xff0000,
          fields: [
            {
              name: 'Configuration actuelle',
              value: Object.entries(config[message.guild.id])
                .filter(([key]) => !['antiSpam', 'antiLink', 'antiInvite'].includes(key))
                .map(([key, value]) => `${key}: ${value}`)
                .join('\n')
            }
          ]
        }]
      });

      // Ajouter les réactions
      await confirmMessage.react('✅');
      await confirmMessage.react('❌');

      // Attendre la réaction
      const filter = (reaction, user) => 
        ['✅', '❌'].includes(reaction.emoji.name) && user.id === message.author.id;

      const collected = await confirmMessage.awaitReactions({ filter, max: 1, time: 30000 });

      // Vérifier la réaction
      const reaction = collected.first();
      if (!reaction || reaction.emoji.name === '❌') {
        return message.reply('Réinitialisation annulée.');
      }

      // Supprimer la configuration du serveur
      delete config[message.guild.id];

      // Sauvegarder la configuration
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));

      message.reply({
        embeds: [{
          title: '✅ Configuration réinitialisée',
          description: 'La configuration du serveur a été réinitialisée avec succès.',
          color: 0x00ff00,
          fields: [
            {
              name: 'Prochaines étapes',
              value: 'Utilisez la commande `config` pour configurer à nouveau le serveur.\n' +
                     'Utilisez `confighelp` pour voir les options disponibles.'
            }
          ]
        }]
      });
    } catch (error) {
      console.error('Erreur configreset:', error);
      message.reply('Une erreur est survenue lors de la réinitialisation de la configuration.');
    }
  }
}; 