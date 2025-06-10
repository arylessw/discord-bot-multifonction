module.exports = {
  name: 'punition',
  description: 'Configure le type de punition appliqué par le système anti-raid',
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

    try {
      // Charger la configuration du serveur
      const config = require('../../config/server_config.json');
      const serverConfig = config[message.guild.id] || {};
      if (!serverConfig.antiraid) {
        serverConfig.antiraid = {};
      }

      // Si aucun argument n'est fourni, afficher la punition actuelle
      if (!args[0]) {
        const currentPunishment = serverConfig.antiraid.punishment || 'kick';
        const punishmentTypes = {
          kick: 'Expulsion',
          ban: 'Bannissement',
          mute: 'Mute temporaire',
          role: 'Rôle de quarantaine'
        };

        return message.reply({
          embeds: [{
            title: '⚖️ Punition actuelle',
            description: `La punition actuelle est : **${punishmentTypes[currentPunishment]}**`,
            color: 0x3498db,
            fields: [
              {
                name: 'ℹ️ Types de punitions disponibles',
                value: Object.entries(punishmentTypes)
                  .map(([key, value]) => `\`${key}\` - ${value}`)
                  .join('\n'),
                inline: false
              },
              {
                name: '💡 Information',
                value: 'Cette punition sera appliquée aux membres qui déclenchent le système anti-raid.',
                inline: false
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      // Vérifier si l'argument est "reset"
      if (args[0].toLowerCase() === 'reset') {
        serverConfig.antiraid.punishment = 'kick';
        message.reply({
          embeds: [{
            title: '✅ Punition réinitialisée',
            description: 'La punition a été réinitialisée à l\'expulsion.',
            color: 0x00ff00,
            timestamp: new Date()
          }]
        });
      } else {
        // Vérifier si l'argument est un type de punition valide
        const validPunishments = ['kick', 'ban', 'mute', 'role'];
        const newPunishment = args[0].toLowerCase();

        if (!validPunishments.includes(newPunishment)) {
          return message.reply({
            embeds: [{
              title: '❌ Type de punition invalide',
              description: 'Types de punitions disponibles : `kick`, `ban`, `mute`, `role`',
              color: 0xff0000,
              timestamp: new Date()
            }]
          });
        }

        // Vérifier les permissions nécessaires
        const requiredPermissions = {
          kick: 'KickMembers',
          ban: 'BanMembers',
          mute: 'ModerateMembers',
          role: 'ManageRoles'
        };

        if (!message.guild.members.me.permissions.has(requiredPermissions[newPunishment])) {
          return message.reply({
            embeds: [{
              title: '❌ Permission manquante',
              description: `Le bot n'a pas la permission ${requiredPermissions[newPunishment]} nécessaire pour cette punition.`,
              color: 0xff0000,
              timestamp: new Date()
            }]
          });
        }

        serverConfig.antiraid.punishment = newPunishment;
        const punishmentTypes = {
          kick: 'Expulsion',
          ban: 'Bannissement',
          mute: 'Mute temporaire',
          role: 'Rôle de quarantaine'
        };

        message.reply({
          embeds: [{
            title: '✅ Punition mise à jour',
            description: `La punition a été définie à : **${punishmentTypes[newPunishment]}**`,
            color: 0x00ff00,
            fields: [
              {
                name: '⚖️ Nouvelle punition',
                value: punishmentTypes[newPunishment],
                inline: true
              },
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              }
            ],
            timestamp: new Date()
          }]
        });
      }

      // Sauvegarder la configuration
      config[message.guild.id] = serverConfig;
      require('fs').writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      // Envoyer un message dans le canal de logs si configuré
      if (serverConfig.logChannel) {
        const logChannel = message.guild.channels.cache.get(serverConfig.logChannel);
        if (logChannel) {
          const punishmentTypes = {
            kick: 'Expulsion',
            ban: 'Bannissement',
            mute: 'Mute temporaire',
            role: 'Rôle de quarantaine'
          };

          const logEmbed = {
            title: '⚙️ Punition modifiée',
            description: `La punition anti-raid a été modifiée par ${message.author.tag}`,
            color: 0x3498db,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '⚖️ Nouvelle punition',
                value: punishmentTypes[serverConfig.antiraid.punishment],
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur punition:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration de la punition.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 