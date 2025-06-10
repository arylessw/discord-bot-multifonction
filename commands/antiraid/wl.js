module.exports = {
  name: 'wl',
  description: 'Gère la whitelist du système anti-raid',
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
      if (!serverConfig.antiraid.whitelist) {
        serverConfig.antiraid.whitelist = [];
      }

      switch (action) {
        case 'add': {
          const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
          if (!target) {
            return message.reply({
              embeds: [{
                title: '❌ Membre non spécifié',
                description: 'Veuillez mentionner un membre ou fournir son ID.',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          if (serverConfig.antiraid.whitelist.includes(target.id)) {
            return message.reply({
              embeds: [{
                title: 'ℹ️ Déjà dans la whitelist',
                description: `${target.user.tag} est déjà dans la whitelist.`,
                color: 0x3498db,
                timestamp: new Date()
              }]
            });
          }

          serverConfig.antiraid.whitelist.push(target.id);
          message.reply({
            embeds: [{
              title: '✅ Membre ajouté à la whitelist',
              description: `${target.user.tag} a été ajouté à la whitelist.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Membre',
                  value: target.user.tag,
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
          const target = message.mentions.members.first() || message.guild.members.cache.get(args[1]);
          if (!target) {
            return message.reply({
              embeds: [{
                title: '❌ Membre non spécifié',
                description: 'Veuillez mentionner un membre ou fournir son ID.',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          if (!serverConfig.antiraid.whitelist.includes(target.id)) {
            return message.reply({
              embeds: [{
                title: 'ℹ️ Pas dans la whitelist',
                description: `${target.user.tag} n'est pas dans la whitelist.`,
                color: 0x3498db,
                timestamp: new Date()
              }]
            });
          }

          serverConfig.antiraid.whitelist = serverConfig.antiraid.whitelist.filter(id => id !== target.id);
          message.reply({
            embeds: [{
              title: '✅ Membre retiré de la whitelist',
              description: `${target.user.tag} a été retiré de la whitelist.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Membre',
                  value: target.user.tag,
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
          if (serverConfig.antiraid.whitelist.length === 0) {
            return message.reply({
              embeds: [{
                title: 'ℹ️ Whitelist vide',
                description: 'Aucun membre n\'est dans la whitelist.',
                color: 0x3498db,
                timestamp: new Date()
              }]
            });
          }

          const whitelistMembers = await Promise.all(
            serverConfig.antiraid.whitelist.map(async id => {
              try {
                const member = await message.guild.members.fetch(id);
                return member.user.tag;
              } catch {
                return `ID: ${id} (Membre non trouvé)`;
              }
            })
          );

          message.reply({
            embeds: [{
              title: '📋 Liste de la whitelist',
              description: 'Voici la liste des membres dans la whitelist :',
              color: 0x3498db,
              fields: [
                {
                  name: '👥 Membres',
                  value: whitelistMembers.join('\n') || 'Aucun membre',
                  inline: false
                },
                {
                  name: '📊 Total',
                  value: `${whitelistMembers.length} membre(s)`,
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
            title: '📋 Whitelist modifiée',
            description: `La whitelist a été modifiée par ${message.author.tag}`,
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
      console.error('Erreur wl:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la gestion de la whitelist.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 