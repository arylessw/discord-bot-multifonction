const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'autobackup',
  description: 'Configure le nombre de jours entre chaque backup automatique',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    const configPath = path.join(__dirname, '../../config/server_config.json');
    let config = {};

    try {
      // Charger la configuration existante
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      // Initialiser la configuration du serveur si elle n'existe pas
      if (!config[message.guild.id]) {
        config[message.guild.id] = {
          autoBackup: {
            enabled: false,
            interval: 7, // 7 jours par défaut
            lastBackup: null
          }
        };
      }

      if (!args[0]) {
        // Afficher la configuration actuelle
        const status = config[message.guild.id].autoBackup.enabled ? 'activé' : 'désactivé';
        const interval = config[message.guild.id].autoBackup.interval;
        const lastBackup = config[message.guild.id].autoBackup.lastBackup 
          ? new Date(config[message.guild.id].autoBackup.lastBackup).toLocaleString()
          : 'Jamais';

        return message.reply(
          'Configuration actuelle des sauvegardes automatiques:\n' +
          `- Statut: ${status}\n` +
          `- Intervalle: ${interval} jour(s)\n` +
          `- Dernière sauvegarde: ${lastBackup}\n\n` +
          'Commandes disponibles:\n' +
          '`autobackup enable <jours>` - Activer les sauvegardes automatiques\n' +
          '`autobackup disable` - Désactiver les sauvegardes automatiques\n' +
          '`autobackup interval <jours>` - Modifier l\'intervalle'
        );
      }

      const subCommand = args[0].toLowerCase();

      switch (subCommand) {
        case 'enable': {
          const days = parseInt(args[1]);
          if (isNaN(days) || days < 1) {
            return message.reply('Veuillez spécifier un nombre de jours valide (minimum 1).');
          }

          config[message.guild.id].autoBackup.enabled = true;
          config[message.guild.id].autoBackup.interval = days;
          message.reply(`✅ Sauvegardes automatiques activées avec un intervalle de ${days} jour(s).`);
          break;
        }

        case 'disable': {
          config[message.guild.id].autoBackup.enabled = false;
          message.reply('✅ Sauvegardes automatiques désactivées.');
          break;
        }

        case 'interval': {
          const days = parseInt(args[1]);
          if (isNaN(days) || days < 1) {
            return message.reply('Veuillez spécifier un nombre de jours valide (minimum 1).');
          }

          config[message.guild.id].autoBackup.interval = days;
          message.reply(`✅ Intervalle de sauvegarde modifié à ${days} jour(s).`);
          break;
        }

        default:
          message.reply('Commande invalide. Utilisez la commande sans arguments pour voir la liste des commandes disponibles.');
      }

      // Sauvegarder la configuration
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Envoyer dans le canal de logs si configuré
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          const embed = {
            title: '💾 Configuration de sauvegarde modifiée',
            fields: [
              {
                name: '📝 Action',
                value: subCommand,
                inline: true
              },
              {
                name: '⏱️ Intervalle',
                value: `${config[message.guild.id].autoBackup.interval} jour(s)`,
                inline: true
              },
              {
                name: '👤 Modérateur',
                value: message.author.toString(),
                inline: true
              }
            ],
            color: 0x00ff00,
            timestamp: new Date()
          };
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur lors de la configuration des sauvegardes automatiques:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration.');
    }
  }
}; 