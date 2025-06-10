const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'reminders',
  description: 'Affiche la liste de vos rappels',
  async execute(message, args, client) {
    const remindersPath = path.join(__dirname, '../../data/reminders.json');
    let reminders = {};
    
    try {
      if (fs.existsSync(remindersPath)) {
        reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf8'));
      }

      if (!reminders[message.author.id] || reminders[message.author.id].length === 0) {
        return message.reply('Vous n\'avez aucun rappel.');
      }

      const userReminders = reminders[message.author.id]
        .sort((a, b) => a.time - b.time)
        .map((reminder, index) => {
          const timeLeft = reminder.time - Date.now();
          const minutes = Math.floor(timeLeft / (1000 * 60));
          const hours = Math.floor(minutes / 60);
          const days = Math.floor(hours / 24);

          let timeString = '';
          if (days > 0) timeString += `${days}j `;
          if (hours % 24 > 0) timeString += `${hours % 24}h `;
          if (minutes % 60 > 0) timeString += `${minutes % 60}m`;

          return `**Rappel #${index + 1}**\n` +
            `Message: ${reminder.message}\n` +
            `Temps restant: ${timeString}\n`;
        });

      const embed = {
        title: '⏰ Vos rappels',
        description: userReminders.join('\n'),
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la récupération des rappels.');
    }
  }
}; 