const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'removereminder',
  description: 'Supprime un rappel spécifique',
  async execute(message, args, client) {
    if (!args[0]) {
      return message.reply('Veuillez spécifier le numéro du rappel à supprimer.');
    }

    const reminderNumber = parseInt(args[0]);
    if (isNaN(reminderNumber) || reminderNumber < 1) {
      return message.reply('Veuillez spécifier un numéro de rappel valide.');
    }

    const remindersPath = path.join(__dirname, '../../data/reminders.json');
    let reminders = {};
    
    try {
      if (fs.existsSync(remindersPath)) {
        reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf8'));
      }

      if (!reminders[message.author.id] || reminders[message.author.id].length === 0) {
        return message.reply('Vous n\'avez aucun rappel.');
      }

      if (reminderNumber > reminders[message.author.id].length) {
        return message.reply('Ce numéro de rappel n\'existe pas.');
      }

      const removedReminder = reminders[message.author.id].splice(reminderNumber - 1, 1)[0];
      fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));

      const embed = {
        title: '⏰ Rappel supprimé',
        description: `Le rappel suivant a été supprimé:\n${removedReminder.message}`,
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la suppression du rappel.');
    }
  }
}; 