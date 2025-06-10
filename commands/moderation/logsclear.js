const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'logsclear',
  description: 'Efface les logs du serveur',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const logsDir = path.join(__dirname, '../../logs');
    const logFile = path.join(logsDir, `${message.guild.id}.json`);

    try {
      // Vérifier si le fichier de logs existe
      if (!fs.existsSync(logFile)) {
        return message.reply('Aucun log n\'existe pour ce serveur.');
      }

      // Charger les logs actuels
      const logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));

      // Demander confirmation
      const confirmMessage = await message.reply({
        embeds: [{
          title: '⚠️ Confirmation de suppression',
          description: 'Êtes-vous sûr de vouloir effacer tous les logs du serveur ?\n' +
                      'Cette action est irréversible.',
          color: 0xff0000,
          fields: [
            {
              name: 'Informations',
              value: `Nombre total de logs: ${logs.length}\n` +
                     `Dernier log: ${new Date(logs[logs.length - 1].timestamp).toLocaleString()}`
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
        return message.reply('Suppression des logs annulée.');
      }

      // Supprimer le fichier de logs
      fs.unlinkSync(logFile);

      message.reply({
        embeds: [{
          title: '✅ Logs effacés',
          description: 'Tous les logs du serveur ont été effacés avec succès.',
          color: 0x00ff00,
          fields: [
            {
              name: 'Détails',
              value: `Nombre de logs supprimés: ${logs.length}\n` +
                     `Date de suppression: ${new Date().toLocaleString()}`
            }
          ]
        }]
      });
    } catch (error) {
      console.error('Erreur logsclear:', error);
      message.reply('Une erreur est survenue lors de la suppression des logs.');
    }
  }
}; 