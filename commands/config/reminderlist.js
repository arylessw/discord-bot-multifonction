const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'reminderlist',
  description: 'Gérer les listes de rappels',
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
      // Créer le dossier config s'il n'existe pas
      if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
      }

      // Charger la configuration existante
      let config = {};
      if (fs.existsSync(configFile)) {
        config = JSON.parse(fs.readFileSync(configFile, 'utf8'));
      }

      // Initialiser la configuration du serveur si elle n'existe pas
      if (!config[message.guild.id]) {
        config[message.guild.id] = {
          reminderlists: {}
        };
      }

      if (!config[message.guild.id].reminderlists) {
        config[message.guild.id].reminderlists = {};
      }

      if (!args[0]) {
        const lists = Object.entries(config[message.guild.id].reminderlists)
          .map(([name, data]) => `${name}: ${data.description}`)
          .join('\n');

        return message.reply(
          'Listes de rappels actuelles:\n' +
          (lists || 'Aucune liste configurée') + '\n\n' +
          'Commandes disponibles:\n' +
          '`reminderlist add <nom> <description>` - Ajouter une liste\n' +
          '`reminderlist remove <nom>` - Supprimer une liste\n' +
          '`reminderlist additem <nom> <message> <intervalle>` - Ajouter un rappel\n' +
          '`reminderlist removeitem <nom> <index>` - Supprimer un rappel\n' +
          '`reminderlist list` - Lister les listes\n' +
          '`reminderlist show <nom>` - Afficher une liste'
        );
      }

      const subCommand = args[0].toLowerCase();
      const name = args[1]?.toLowerCase();
      const content = args.slice(2).join(' ');

      switch (subCommand) {
        case 'add':
          if (!name || !content) {
            return message.reply('Veuillez spécifier un nom et une description.');
          }
          config[message.guild.id].reminderlists[name] = {
            description: content,
            reminders: [],
            createdBy: message.author.id,
            createdAt: new Date().toISOString()
          };
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La liste "${name}" a été ajoutée.`);
          break;

        case 'remove':
          if (!name) {
            return message.reply('Veuillez spécifier un nom de liste.');
          }
          if (!config[message.guild.id].reminderlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          delete config[message.guild.id].reminderlists[name];
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La liste "${name}" a été supprimée.`);
          break;

        case 'additem':
          if (!name || !content) {
            return message.reply('Veuillez spécifier un nom de liste, un message et un intervalle.');
          }
          if (!config[message.guild.id].reminderlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          const [message, interval] = content.split('|').map(s => s.trim());
          if (!message || !interval) {
            return message.reply('Format invalide. Utilisez: <message> | <intervalle>');
          }
          config[message.guild.id].reminderlists[name].reminders.push({
            message,
            interval,
            lastTriggered: null
          });
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rappel a été ajouté à la liste "${name}".`);
          break;

        case 'removeitem':
          if (!name || !content) {
            return message.reply('Veuillez spécifier un nom de liste et un index.');
          }
          if (!config[message.guild.id].reminderlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          const index = parseInt(content) - 1;
          if (isNaN(index) || index < 0 || index >= config[message.guild.id].reminderlists[name].reminders.length) {
            return message.reply('Index invalide.');
          }
          config[message.guild.id].reminderlists[name].reminders.splice(index, 1);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le rappel a été supprimé de la liste "${name}".`);
          break;

        case 'list':
          const listList = Object.entries(config[message.guild.id].reminderlists)
            .map(([name, data]) => `${name}: ${data.description}`)
            .join('\n');
          message.reply(
            'Liste des listes de rappels:\n' +
            (listList || 'Aucune liste configurée')
          );
          break;

        case 'show':
          if (!name) {
            return message.reply('Veuillez spécifier un nom de liste.');
          }
          if (!config[message.guild.id].reminderlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          const list = config[message.guild.id].reminderlists[name];
          const reminders = list.reminders.map((reminder, i) => 
            `${i + 1}. Message: ${reminder.message}\n   Intervalle: ${reminder.interval}`
          ).join('\n\n');
          message.reply(
            `Liste "${name}":\n` +
            `Description: ${list.description}\n\n` +
            'Rappels:\n' +
            (reminders || 'Aucun rappel')
          );
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des listes de rappels:', error);
      message.reply('❌ Une erreur est survenue lors de la gestion des listes.');
    }
  }
};
