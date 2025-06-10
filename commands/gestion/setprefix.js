module.exports = {
  name: 'setprefix',
  description: 'Configure le préfixe du bot',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Cette commande doit être utilisée dans un serveur.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply({
        embeds: [{
          title: '❌ Permission manquante',
          description: 'Vous devez avoir la permission d\'administrateur pour utiliser cette commande.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    // Si aucun argument n'est fourni, afficher le préfixe actuel
    if (!args[0]) {
      const config = require('../../config/server_config.json');
      const currentPrefix = config[message.guild.id]?.prefix || client.config.prefix;
      
      return message.reply({
        embeds: [{
          title: 'ℹ️ Préfixe actuel',
          description: `Le préfixe actuel est \`${currentPrefix}\`.`,
          color: 0x3498db,
          fields: [
            {
              name: '🔤 Préfixe',
              value: currentPrefix,
              inline: true
            },
            {
              name: 'ℹ️ Information',
              value: 'Pour changer le préfixe, utilisez cette commande suivi du nouveau préfixe.',
              inline: false
            }
          ],
          timestamp: new Date()
        }]
      });
    }

    // Si l'argument est "reset", réinitialiser le préfixe
    if (args[0].toLowerCase() === 'reset') {
      const config = require('../../config/server_config.json');
      const oldPrefix = config[message.guild.id]?.prefix;
      
      if (!oldPrefix) {
        return message.reply({
          embeds: [{
            title: 'ℹ️ Information',
            description: 'Le préfixe n\'a pas été modifié.',
            color: 0x3498db,
            timestamp: new Date()
          }]
        });
      }

      delete config[message.guild.id].prefix;

      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      const embed = {
        title: '✅ Préfixe réinitialisé',
        description: `Le préfixe a été réinitialisé à \`${client.config.prefix}\`.`,
        color: 0x00ff00,
        fields: [
          {
            name: '👤 Administrateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '🔄 Ancien préfixe',
            value: oldPrefix,
            inline: true
          },
          {
            name: '🔤 Nouveau préfixe',
            value: client.config.prefix,
            inline: true
          }
        ],
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });

      // Envoyer un message dans le canal de logs si configuré
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }

      return;
    }

    const newPrefix = args[0];
    if (!newPrefix) {
      return message.reply({
        embeds: [{
          title: '❌ Préfixe non spécifié',
          description: 'Veuillez spécifier un nouveau préfixe.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    if (newPrefix.length > 5) {
      return message.reply({
        embeds: [{
          title: '❌ Préfixe trop long',
          description: 'Le préfixe ne peut pas dépasser 5 caractères.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    // Vérifier si le préfixe contient des caractères spéciaux
    if (!/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/.test(newPrefix)) {
      return message.reply({
        embeds: [{
          title: '❌ Préfixe invalide',
          description: 'Le préfixe ne peut contenir que des lettres, des chiffres et des caractères spéciaux.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }

    try {
      // Charger ou créer la configuration
      const config = require('../../config/server_config.json');
      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      const oldPrefix = config[message.guild.id].prefix || client.config.prefix;

      // Mettre à jour la configuration
      config[message.guild.id].prefix = newPrefix;

      // Sauvegarder la configuration
      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      const embed = {
        title: '✅ Préfixe configuré',
        description: `Le préfixe a été configuré sur \`${newPrefix}\`.`,
        color: 0x00ff00,
        fields: [
          {
            name: '👤 Administrateur',
            value: message.author.tag,
            inline: true
          },
          {
            name: '🔄 Ancien préfixe',
            value: oldPrefix,
            inline: true
          },
          {
            name: '🔤 Nouveau préfixe',
            value: newPrefix,
            inline: true
          }
        ],
        timestamp: new Date()
      };

      // Envoyer un message de confirmation
      message.reply({ embeds: [embed] });

      // Envoyer un message dans le canal de logs si configuré
      if (config[message.guild.id]?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].logChannel);
        if (logChannel) {
          logChannel.send({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Erreur setprefix:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration du préfixe.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 