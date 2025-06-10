const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'antiraid',
  description: 'Configure le système anti-raid',
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

    // Si aucun argument n'est fourni, afficher le statut actuel
    if (!args[0]) {
      const config = require('../../config/server_config.json');
      const raidConfig = config[message.guild.id]?.antiraid || {};
      
      const embed = {
        title: '🛡️ Configuration Anti-Raid',
        description: 'Voici la configuration actuelle du système anti-raid :',
        color: 0x3498db,
        fields: [
          {
            name: '🔄 État',
            value: raidConfig.enabled ? '✅ Activé' : '❌ Désactivé',
            inline: true
          },
          {
            name: '⚡ Niveau de sécurité',
            value: raidConfig.securityLevel || 'Normal',
            inline: true
          },
          {
            name: '👥 Limite de création',
            value: raidConfig.creationLimit ? `${raidConfig.creationLimit} comptes` : 'Non configuré',
            inline: true
          },
          {
            name: '⏱️ Délai de vérification',
            value: raidConfig.verificationDelay ? `${raidConfig.verificationDelay} secondes` : 'Non configuré',
            inline: true
          },
          {
            name: '🔨 Punition',
            value: raidConfig.punishment || 'Kick',
            inline: true
          },
          {
            name: '📝 Canal de logs',
            value: raidConfig.logChannel ? `<#${raidConfig.logChannel}>` : 'Non configuré',
            inline: true
          }
        ],
        timestamp: new Date()
      };

      return message.reply({ embeds: [embed] });
    }

    const action = args[0].toLowerCase();
    const config = require('../../config/server_config.json');
    if (!config[message.guild.id]) {
      config[message.guild.id] = {};
    }
    if (!config[message.guild.id].antiraid) {
      config[message.guild.id].antiraid = {};
    }

    try {
      switch (action) {
        case 'on':
        case 'enable':
          config[message.guild.id].antiraid.enabled = true;
          message.reply({
            embeds: [{
              title: '✅ Anti-Raid activé',
              description: 'Le système anti-raid a été activé.',
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Administrateur',
                  value: message.author.tag,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;

        case 'off':
        case 'disable':
          config[message.guild.id].antiraid.enabled = false;
          message.reply({
            embeds: [{
              title: '❌ Anti-Raid désactivé',
              description: 'Le système anti-raid a été désactivé.',
              color: 0xff0000,
              fields: [
                {
                  name: '👤 Administrateur',
                  value: message.author.tag,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;

        case 'security':
        case 'level':
          const level = args[1]?.toLowerCase();
          if (!level || !['low', 'normal', 'high', 'extreme'].includes(level)) {
            return message.reply({
              embeds: [{
                title: '❌ Niveau invalide',
                description: 'Veuillez spécifier un niveau valide : `low`, `normal`, `high` ou `extreme`.',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          config[message.guild.id].antiraid.securityLevel = level;
          message.reply({
            embeds: [{
              title: '⚡ Niveau de sécurité modifié',
              description: `Le niveau de sécurité a été défini sur \`${level}\`.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Administrateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '⚡ Nouveau niveau',
                  value: level,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;

        case 'limit':
          const limit = parseInt(args[1]);
          if (isNaN(limit) || limit < 1) {
            return message.reply({
              embeds: [{
                title: '❌ Limite invalide',
                description: 'Veuillez spécifier une limite valide (nombre positif).',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          config[message.guild.id].antiraid.creationLimit = limit;
          message.reply({
            embeds: [{
              title: '👥 Limite de création modifiée',
              description: `La limite de création a été définie sur \`${limit}\` comptes.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Administrateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '👥 Nouvelle limite',
                  value: `${limit} comptes`,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;

        case 'delay':
          const delay = parseInt(args[1]);
          if (isNaN(delay) || delay < 0) {
            return message.reply({
              embeds: [{
                title: '❌ Délai invalide',
                description: 'Veuillez spécifier un délai valide (nombre positif).',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          config[message.guild.id].antiraid.verificationDelay = delay;
          message.reply({
            embeds: [{
              title: '⏱️ Délai de vérification modifié',
              description: `Le délai de vérification a été défini sur \`${delay}\` secondes.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Administrateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '⏱️ Nouveau délai',
                  value: `${delay} secondes`,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;

        case 'punishment':
          const punishment = args[1]?.toLowerCase();
          if (!punishment || !['kick', 'ban', 'quarantine'].includes(punishment)) {
            return message.reply({
              embeds: [{
                title: '❌ Punition invalide',
                description: 'Veuillez spécifier une punition valide : `kick`, `ban` ou `quarantine`.',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          config[message.guild.id].antiraid.punishment = punishment;
          message.reply({
            embeds: [{
              title: '🔨 Punition modifiée',
              description: `La punition a été définie sur \`${punishment}\`.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Administrateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '🔨 Nouvelle punition',
                  value: punishment,
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;

        case 'log':
          const channel = message.mentions.channels.first() || message.guild.channels.cache.get(args[1]);
          if (!channel) {
            return message.reply({
              embeds: [{
                title: '❌ Canal non spécifié',
                description: 'Veuillez mentionner un canal ou fournir son ID.',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          if (!channel.permissionsFor(message.guild.members.me).has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
            return message.reply({
              embeds: [{
                title: '❌ Permissions manquantes',
                description: 'Je n\'ai pas les permissions nécessaires dans ce canal (Voir le canal, Envoyer des messages, Intégrer des liens).',
                color: 0xff0000,
                timestamp: new Date()
              }]
            });
          }

          config[message.guild.id].antiraid.logChannel = channel.id;
          message.reply({
            embeds: [{
              title: '📝 Canal de logs modifié',
              description: `Le canal de logs a été défini sur ${channel}.`,
              color: 0x00ff00,
              fields: [
                {
                  name: '👤 Administrateur',
                  value: message.author.tag,
                  inline: true
                },
                {
                  name: '📝 Nouveau canal',
                  value: channel.toString(),
                  inline: true
                }
              ],
              timestamp: new Date()
            }]
          });
          break;

        default:
          return message.reply({
            embeds: [{
              title: '❌ Action invalide',
              description: 'Actions disponibles : `on/off`, `security`, `limit`, `delay`, `punishment`, `log`',
              color: 0xff0000,
              timestamp: new Date()
            }]
          });
      }

      // Sauvegarder la configuration
      const fs = require('fs');
      fs.writeFileSync('./config/server_config.json', JSON.stringify(config, null, 2));

      // Envoyer un message dans le canal de logs si configuré
      if (config[message.guild.id]?.antiraid?.logChannel) {
        const logChannel = message.guild.channels.cache.get(config[message.guild.id].antiraid.logChannel);
        if (logChannel) {
          logChannel.send({
            embeds: [{
              title: '🛡️ Configuration Anti-Raid modifiée',
              description: `La configuration anti-raid a été modifiée par ${message.author.tag}.`,
              color: 0x3498db,
              fields: [
                {
                  name: '👤 Administrateur',
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
            }]
          });
        }
      }
    } catch (error) {
      console.error('Erreur antiraid:', error);
      message.reply({
        embeds: [{
          title: '❌ Erreur',
          description: 'Une erreur est survenue lors de la configuration du système anti-raid.',
          color: 0xff0000,
          timestamp: new Date()
        }]
      });
    }
  }
}; 