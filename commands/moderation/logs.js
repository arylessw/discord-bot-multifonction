const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'logs',
  description: 'Affiche les logs du serveur',
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
      // Vérifier si le dossier logs existe
      if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
      }

      // Vérifier si le fichier de logs existe
      if (!fs.existsSync(logFile)) {
        return message.reply('Aucun log n\'existe pour ce serveur.');
      }

      // Charger les logs
      const logs = JSON.parse(fs.readFileSync(logFile, 'utf8'));

      // Filtrer les logs si un type est spécifié
      let filteredLogs = logs;
      if (args[0]) {
        const type = args[0].toLowerCase();
        filteredLogs = logs.filter(log => log.type.toLowerCase() === type);
        if (filteredLogs.length === 0) {
          return message.reply(`Aucun log de type "${type}" n'a été trouvé.`);
        }
      }

      // Trier les logs par date (du plus récent au plus ancien)
      filteredLogs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      // Limiter à 10 logs par page
      const logsPerPage = 10;
      const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
      let currentPage = args[1] ? parseInt(args[1]) : 1;

      if (isNaN(currentPage) || currentPage < 1 || currentPage > totalPages) {
        currentPage = 1;
      }

      const startIndex = (currentPage - 1) * logsPerPage;
      const endIndex = startIndex + logsPerPage;
      const pageLogs = filteredLogs.slice(startIndex, endIndex);

      // Créer l'embed
      const embed = {
        title: '📋 Logs du Serveur',
        description: `Affichage des logs ${args[0] ? `de type "${args[0]}" ` : ''}pour ${message.guild.name}`,
        fields: pageLogs.map(log => ({
          name: `${log.type} - ${new Date(log.timestamp).toLocaleString()}`,
          value: `**Action:** ${log.action}\n` +
                 `**Modérateur:** ${log.moderator}\n` +
                 `**Utilisateur:** ${log.user}\n` +
                 `**Raison:** ${log.reason || 'Aucune'}\n` +
                 `**ID:** ${log.id}`,
          inline: false
        })),
        color: 0x00ff00,
        timestamp: new Date(),
        footer: {
          text: `Page ${currentPage}/${totalPages} • Total: ${filteredLogs.length} logs`
        }
      };

      const logMessage = await message.reply({ embeds: [embed] });

      // Ajouter les réactions pour la navigation
      if (totalPages > 1) {
        await logMessage.react('⬅️');
        await logMessage.react('➡️');

        const filter = (reaction, user) => 
          ['⬅️', '➡️'].includes(reaction.emoji.name) && user.id === message.author.id;

        const collector = logMessage.createReactionCollector({ filter, time: 60000 });

        collector.on('collect', async (reaction, user) => {
          if (reaction.emoji.name === '⬅️' && currentPage > 1) {
            currentPage--;
          } else if (reaction.emoji.name === '➡️' && currentPage < totalPages) {
            currentPage++;
          }

          const newStartIndex = (currentPage - 1) * logsPerPage;
          const newEndIndex = newStartIndex + logsPerPage;
          const newPageLogs = filteredLogs.slice(newStartIndex, newEndIndex);

          const newEmbed = {
            ...embed,
            fields: newPageLogs.map(log => ({
              name: `${log.type} - ${new Date(log.timestamp).toLocaleString()}`,
              value: `**Action:** ${log.action}\n` +
                     `**Modérateur:** ${log.moderator}\n` +
                     `**Utilisateur:** ${log.user}\n` +
                     `**Raison:** ${log.reason || 'Aucune'}\n` +
                     `**ID:** ${log.id}`,
              inline: false
            })),
            footer: {
              text: `Page ${currentPage}/${totalPages} • Total: ${filteredLogs.length} logs`
            }
          };

          await logMessage.edit({ embeds: [newEmbed] });
          await reaction.users.remove(user.id);
        });

        collector.on('end', () => {
          logMessage.reactions.removeAll();
        });
      }
    } catch (error) {
      console.error('Erreur logs:', error);
      message.reply('Une erreur est survenue lors de la récupération des logs.');
    }
  }
}; 