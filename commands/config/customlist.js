const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'customlist',
  description: 'Configurer les listes personnalisées',
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
          customlists: {}
        };
      }

      if (!config[message.guild.id].customlists) {
        config[message.guild.id].customlists = {};
      }

      if (!args[0]) {
        const lists = Object.entries(config[message.guild.id].customlists)
          .map(([name, data]) => `${name}: ${data.description}`)
          .join('\n');

        return message.reply(
          'Listes personnalisées actuelles:\n' +
          (lists || 'Aucune liste configurée') + '\n\n' +
          'Commandes disponibles:\n' +
          '`customlist add <nom> <description>` - Ajouter une liste\n' +
          '`customlist remove <nom>` - Supprimer une liste\n' +
          '`customlist additem <nom> <item>` - Ajouter un élément à une liste\n' +
          '`customlist removeitem <nom> <index>` - Supprimer un élément d\'une liste\n' +
          '`customlist list` - Lister les listes\n' +
          '`customlist show <nom>` - Afficher une liste'
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
          config[message.guild.id].customlists[name] = {
            description: content,
            items: [],
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
          if (!config[message.guild.id].customlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          delete config[message.guild.id].customlists[name];
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La liste "${name}" a été supprimée.`);
          break;

        case 'additem':
          if (!name || !content) {
            return message.reply('Veuillez spécifier un nom de liste et un élément.');
          }
          if (!config[message.guild.id].customlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          config[message.guild.id].customlists[name].items.push(content);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'élément a été ajouté à la liste "${name}".`);
          break;

        case 'removeitem':
          if (!name || !content) {
            return message.reply('Veuillez spécifier un nom de liste et un index.');
          }
          if (!config[message.guild.id].customlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          const index = parseInt(content) - 1;
          if (isNaN(index) || index < 0 || index >= config[message.guild.id].customlists[name].items.length) {
            return message.reply('Index invalide.');
          }
          config[message.guild.id].customlists[name].items.splice(index, 1);
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ L'élément a été supprimé de la liste "${name}".`);
          break;

        case 'list':
          const listList = Object.entries(config[message.guild.id].customlists)
            .map(([name, data]) => `${name}: ${data.description}`)
            .join('\n');
          message.reply(
            'Liste des listes personnalisées:\n' +
            (listList || 'Aucune liste configurée')
          );
          break;

        case 'show':
          if (!name) {
            return message.reply('Veuillez spécifier un nom de liste.');
          }
          if (!config[message.guild.id].customlists[name]) {
            return message.reply('Cette liste n\'existe pas.');
          }
          const list = config[message.guild.id].customlists[name];
          const items = list.items.map((item, i) => `${i + 1}. ${item}`).join('\n');
          message.reply(
            `Liste "${name}":\n` +
            `Description: ${list.description}\n\n` +
            'Éléments:\n' +
            (items || 'Aucun élément')
          );
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des listes personnalisées:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
