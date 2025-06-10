module.exports = {
  name: 'blrank',
  description: 'Gère la blacklist des rôles pour le système anti-raid',
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

    const action = args[0]?.toLowerCase();
    if (!action || !['add', 'remove', 'list'].includes(action)) {
      return message.reply({
        embeds: [{
          title: '❌ Action invalide',
          description: 'Actions disponibles : `add`, `remove`, `list`',
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
      if (!serverConfig.antiraid.blacklistedRoles) {
        serverConfig.antiraid.blacklistedRoles = [];
      }

      switch (action) {
        case 'add': {
          const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
          if (!role) {
            return message.reply({
              embeds: [{
                title: '❌ Rôle non spécifié',
                description: 'Veuillez mentionner un rôle ou fournir son ID.',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          if (serverConfig.antiraid.blacklistedRoles.includes(role.id)) {
            return message.reply({
              embeds: [{
                title: 'ℹ️ Déjà dans la blacklist',
                description: `Le rôle ${role.name} est déjà dans la blacklist.`,
                color: 0x3498db,
                timestamp: new Date()
              }]
            });
          }

          serverConfig.antiraid.blacklistedRoles.push(role.id);
          message.reply({
            embeds: [{
              title: '✅ Rôle ajouté à la blacklist',
              description: `Le rôle ${role.name} a été ajouté à la blacklist.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '🎭 Rôle',
                  value: role.name,
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
          break;
        }

        case 'remove': {
          const role = message.mentions.roles.first() || message.guild.roles.cache.get(args[1]);
          if (!role) {
            return message.reply({
              embeds: [{
                title: '❌ Rôle non spécifié',
                description: 'Veuillez mentionner un rôle ou fournir son ID.',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          if (!serverConfig.antiraid.blacklistedRoles.includes(role.id)) {
            return message.reply({
              embeds: [{
                title: 'ℹ️ Pas dans la blacklist',
                description: `Le rôle ${role.name} n'est pas dans la blacklist.`,
                color: 0x3498db,
                timestamp: new Date()
              }]
            });
          }

          serverConfig.antiraid.blacklistedRoles = serverConfig.antiraid.blacklistedRoles.filter(id => id !== role.id);
          message.reply({
            embeds: [{
              title: '✅ Rôle retiré de la blacklist',
              description: `Le rôle ${role.name} a été retiré de la blacklist.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '🎭 Rôle',
                  value: role.name,
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
          break;
        }

        case 'list': {
          if (serverConfig.antiraid.blacklistedRoles.length === 0) {
            return message.reply({
              embeds: [{
                title: 'ℹ️ Blacklist vide',
                description: 'Aucun rôle n\'est dans la blacklist.',
                color: 0x3498db,
                timestamp: new Date()
              }]
            });
          }

          const blacklistedRoles = serverConfig.antiraid.blacklistedRoles.map(id => {
            const role = message.guild.roles.cache.get(id);
            return role ? role.name : `ID: ${id} (Rôle non trouvé)`;
          });

          message.reply({
            embeds: [{
              title: '📋 Liste des rôles blacklistés',
              description: 'Voici la liste des rôles dans la blacklist :',
              color: 0x3498db,
              fields: [
                {
                  name: '🎭 Rôles',
                  value: blacklistedRoles.join('\n') || 'Aucun rôle',
                  inline: false
                },
                {
                  name: '📊 Total',
                  value: `${blacklistedRoles.length} rôle(s)`,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;
        }
      }

      // Sauvegarder la configuration
      config[message.guild.id] = serverConfig;
      require('fs').writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      // Envoyer un message dans le canal de logs si configuré
      if (serverConfig.logChannel) {
        const logChannel = message.guild.channels.cache.get(serverConfig.logChannel);
        if (logChannel) {
          const logEmbed = {
            title: '📋 Blacklist des rôles modifiée',
            description: `La blacklist des rôles a été modifiée par ${message.author.tag}`,
            color: 0x3498db,
            fields: [
              {
                name: '👮 Modérateur',
                value: message.author.tag,
                inline: true
              },
              {
                name: '🔄 Action',
                value: action,
                inline: true
              }
            ],
            timestamp: new Date()
          };
          logChannel.send({ embeds: [logEmbed] });
        }
      }

    } catch (error) {
      console.error('Erreur blrank:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la gestion de la blacklist des rôles.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 