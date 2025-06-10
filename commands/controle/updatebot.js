const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

module.exports = {
  name: 'updatebot',
  description: 'Mettre à jour le bot',
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

      if (!args[0]) {
        return message.reply(
          'Commandes disponibles:\n' +
          '`updatebot check` - Vérifier les mises à jour disponibles\n' +
          '`updatebot update` - Mettre à jour le bot\n' +
          '`updatebot restart` - Redémarrer le bot\n' +
          '`updatebot logchannel <#channel>` - Définir le canal de logs\n' +
          '`updatebot color <couleur>` - Définir la couleur de l\'embed\n' +
          '`updatebot title <titre>` - Définir le titre de l\'embed\n' +
          '`updatebot footer <texte>` - Définir le pied de page'
        );
      }

      // Initialiser la configuration du serveur si elle n'existe pas
      if (!config[message.guild.id]) {
        config[message.guild.id] = {
          updateSettings: {
            logChannel: null,
            embed: {
              color: '#00ff00',
              title: 'Mise à jour du bot',
              footer: 'Système de mise à jour'
            }
          }
        };
      }

      if (!config[message.guild.id].updateSettings) {
        config[message.guild.id].updateSettings = {
          logChannel: null,
          embed: {
            color: '#00ff00',
            title: 'Mise à jour du bot',
            footer: 'Système de mise à jour'
          }
        };
      }

      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'check':
          try {
            const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD');
            const { stdout: currentCommit } = await execAsync('git rev-parse HEAD');
            const { stdout: remoteInfo } = await execAsync('git remote -v');
            const { stdout: fetchOutput } = await execAsync('git fetch');
            const { stdout: diffOutput } = await execAsync('git diff --name-only origin/' + currentBranch.trim());

            if (diffOutput.trim()) {
              message.reply(
                'Des mises à jour sont disponibles !\n' +
                `Branche actuelle: ${currentBranch.trim()}\n` +
                `Commit actuel: ${currentCommit.trim()}\n` +
                'Utilisez `updatebot update` pour mettre à jour le bot.'
              );
            } else {
              message.reply('Le bot est à jour !');
            }
          } catch (error) {
            console.error('Erreur lors de la vérification des mises à jour:', error);
            message.reply('❌ Une erreur est survenue lors de la vérification des mises à jour.');
          }
          break;

        case 'update':
          try {
            const { stdout: currentBranch } = await execAsync('git rev-parse --abbrev-ref HEAD');
            const { stdout: currentCommit } = await execAsync('git rev-parse HEAD');
            const { stdout: pullOutput } = await execAsync('git pull origin ' + currentBranch.trim());
            const { stdout: npmOutput } = await execAsync('npm install');

            message.reply(
              '✅ Le bot a été mis à jour avec succès !\n' +
              `Branche: ${currentBranch.trim()}\n` +
              `Commit: ${currentCommit.trim()}\n` +
              'Utilisez `updatebot restart` pour redémarrer le bot.'
            );
          } catch (error) {
            console.error('Erreur lors de la mise à jour:', error);
            message.reply('❌ Une erreur est survenue lors de la mise à jour.');
          }
          break;

        case 'restart':
          try {
            message.reply('🔄 Redémarrage du bot en cours...');
            process.exit(0); // Le processus sera redémarré par le gestionnaire de processus
          } catch (error) {
            console.error('Erreur lors du redémarrage:', error);
            message.reply('❌ Une erreur est survenue lors du redémarrage.');
          }
          break;

        case 'logchannel':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].updateSettings.logChannel = logChannel.id;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ Le canal de logs a été défini sur ${logChannel.name}`);
          break;

        case 'color':
          if (!value.match(/^#[0-9A-Fa-f]{6}$/)) {
            return message.reply('Veuillez spécifier une couleur valide au format hexadécimal (ex: #00ff00).');
          }
          config[message.guild.id].updateSettings.embed.color = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply(`✅ La couleur de l'embed a été définie sur ${value}`);
          break;

        case 'title':
          if (!value) {
            return message.reply('Veuillez spécifier un titre.');
          }
          config[message.guild.id].updateSettings.embed.title = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le titre de l\'embed a été mis à jour.');
          break;

        case 'footer':
          if (!value) {
            return message.reply('Veuillez spécifier un texte.');
          }
          config[message.guild.id].updateSettings.embed.footer = value;
          fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
          message.reply('✅ Le pied de page de l\'embed a été mis à jour.');
          break;

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }
    } catch (error) {
      console.error('Erreur lors de la gestion des mises à jour:', error);
      message.reply('❌ Une erreur est survenue lors de la gestion des mises à jour.');
    }
  }
};
