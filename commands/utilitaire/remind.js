const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'remind',
  description: 'Crée un rappel',
  async execute(message, args, client) {
    if (!args[0]) {
      return message.reply('Veuillez spécifier une durée (ex: 1h, 30m, 1d).');
    }

    if (!args[1]) {
      return message.reply('Veuillez spécifier un message pour le rappel.');
    }

    const duration = args[0];
    const timeRegex = /^(\d+)([mhd])$/;
    const match = duration.match(timeRegex);

    if (!match) {
      return message.reply('Format de durée invalide. Utilisez un nombre suivi de m (minutes), h (heures) ou d (jours).');
    }

    const [, amount, unit] = match;
    const ms = {
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000
    }[unit] * parseInt(amount);

    if (ms > 30 * 24 * 60 * 60 * 1000) {
      return message.reply('La durée maximale est de 30 jours.');
    }

    const reminderMessage = args.slice(1).join(' ');
    const reminderTime = Date.now() + ms;

    const remindersPath = path.join(__dirname, '../../data/reminders.json');
    let reminders = {};
    
    try {
      if (fs.existsSync(remindersPath)) {
        reminders = JSON.parse(fs.readFileSync(remindersPath, 'utf8'));
      }

      if (!reminders[message.author.id]) {
        reminders[message.author.id] = [];
      }

      reminders[message.author.id].push({
        message: reminderMessage,
        time: reminderTime,
        channelId: message.channel.id
      });

      fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));

      const embed = {
        title: '⏰ Rappel créé',
        description: `Je vous rappellerai dans ${duration}:\n${reminderMessage}`,
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });

      setTimeout(async () => {
        try {
          const channel = await client.channels.fetch(message.channel.id);
          if (channel) {
            const reminderEmbed = {
              title: '⏰ Rappel',
              description: reminderMessage,
              color: 0x00ff00,
              timestamp: new Date()
            };

            channel.send({ content: `<@${message.author.id}>`, embeds: [reminderEmbed] });

            reminders[message.author.id] = reminders[message.author.id].filter(r => r.time !== reminderTime);
            fs.writeFileSync(remindersPath, JSON.stringify(reminders, null, 2));
          }
        } catch (error) {
          console.error('Erreur lors de l\'envoi du rappel:', error);
        }
      }, ms);
    } catch (error) {
      message.reply('Une erreur est survenue lors de la création du rappel.');
    }
  }
}; 