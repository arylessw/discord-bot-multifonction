const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'customtransfer',
  description: 'Configurer les transferts personnalisés',
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
          customtransfers: {}
        };
      }

      if (!config[message.guild.id].customtransfers) {
        config[message.guild.id].customtransfers = {};
      }

      if (!args[0]) {
        const transfers = Object.entries(config[message.guild.id].customtransfers)
          .map(([name, data]) => `${name}: ${data.description}`)
          .join('\n');

        return message.reply(
          'Transferts personnalisés actuels:\n' +
          (transfers || 'Aucun transfert configuré') + '\n\n' +
          'Commandes disponibles:\n' +
          '`customtransfer add <nom> <description>` - Ajouter un transfert\n' +
          '`customtransfer remove <nom>` - Supprimer un transfert\n' +
          '`customtransfer list` - Lister les transferts'
        );
      }

      const subCommand = args[0].toLowerCase();
      const name = args[1]?.toLowerCase();
      const description = args.slice(2).join(' ');

      switch (subCommand) {
        case 'add':
          if (!name || !description) {
            return message.reply('Veuillez spécifier un nom et une description.');
          }
          config[message.guild.id].customtransfers[name] = {
            description,
            createdBy: message.author.id,
            createdAt: new Date().toISOString()
          };
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le transfert "${name}" a été ajouté.`);
          break;

        case 'remove':
          if (!name) {
            return message.reply('Veuillez spécifier un nom de transfert.');
          }
          if (!config[message.guild.id].customtransfers[name]) {
            return message.reply('Ce transfert n\'existe pas.');
          }
          delete config[message.guild.id].customtransfers[name];
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le transfert "${name}" a été supprimé.`);
          break;

        case 'list':
          const transferList = Object.entries(config[message.guild.id].customtransfers)
            .map(([name, data]) => `${name}: ${data.description}`)
            .join('\n');
          message.reply(
            'Liste des transferts personnalisés:\n' +
            (transferList || 'Aucun transfert configuré')
          );
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des transferts personnalisés:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
};
