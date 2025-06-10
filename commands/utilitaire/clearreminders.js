const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'clearreminders',
  description: 'Supprime tous vos rappels',
  async execute(message, args, client) {
    const remindersPath = path.join(__dirname, '../../data/reminders.json');
    let reminders = {};
    
    try {
      if (fs.existsSync(remindersPath)) {
        reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf8'));
      }

      if (!reminders[message.author.id] || reminders[message.author.id].length === 0) {
        return message.reply('Vous n\'avez aucun rappel à supprimer.');
      }

      delete reminders[message.author.id];
      fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));

      const embed = {
        title: '⏰ Rappels supprimés',
        description: 'Tous vos rappels ont été supprimés.',
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors de la suppression des rappels.');
    }
  }
}; 