const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




module.exports = {
  name: 'config',
  description: 'Configure les paramètres du serveur',
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
          prefix: '!',
          welcomeChannel: null,
          welcomeMessage: 'Bienvenue {user} sur {server} !',
          leaveMessage: 'Au revoir {user} !',
          autoRole: null,
          logChannel: null,
          modRole: null,
          adminRole: null,
          mutedRole: null,
          defaultLanguage: 'fr',
          timezone: 'Europe/Paris',
          embedColor: '#00ff00',
          maxWarnings: 3,
          antiSpam: {
            enabled: false,
            maxMessages: 5,
            timeWindow: 5,
            punishment: 'mute'
          },
          antiLink: {
            enabled: false,
            whitelist: [],
            punishment: 'delete'
          },
          antiInvite: {
            enabled: false,
            punishment: 'delete'
          }
        };
      }

      // Si aucun argument n'est fourni, afficher la configuration actuelle
      if (!args[0]) {
        const embed = {
          title: '⚙️ Configuration du Serveur',
          description: `Configuration actuelle pour ${message.guild.name}`,
          fields: [
            {
              name: '📝 Paramètres de base',
              value: `Préfixe: ${config[message.guild.id].prefix}\n` +
                     `Langue: ${config[message.guild.id].defaultLanguage}\n` +
                     `Fuseau horaire: ${config[message.guild.id].timezone}\n` +
                     `Couleur des embeds: ${config[message.guild.id].embedColor}`,
              inline: true
            },
            {
              name: '👋 Messages de bienvenue',
              value: `Canal: ${config[message.guild.id].welcomeChannel ? `<#${config[message.guild.id].welcomeChannel}>` : 'Non configuré'}\n` +
                     `Message: ${config[message.guild.id].welcomeMessage}\n` +
                     `Message de départ: ${config[message.guild.id].leaveMessage}`,
              inline: true
            },
            {
              name: '👥 Rôles',
              value: `Rôle automatique: ${config[message.guild.id].autoRole ? `<@&${config[message.guild.id].autoRole}>` : 'Non configuré'}\n` +
                     `Rôle modérateur: ${config[message.guild.id].modRole ? `<@&${config[message.guild.id].modRole}>` : 'Non configuré'}\n` +
                     `Rôle admin: ${config[message.guild.id].adminRole ? `<@&${config[message.guild.id].adminRole}>` : 'Non configuré'}\n` +
                     `Rôle muet: ${config[message.guild.id].mutedRole ? `<@&${config[message.guild.id].mutedRole}>` : 'Non configuré'}`,
              inline: true
            },
            {
              name: '📊 Modération',
              value: `Canal de logs: ${config[message.guild.id].logChannel ? `<#${config[message.guild.id].logChannel}>` : 'Non configuré'}\n` +
                     `Avertissements max: ${config[message.guild.id].maxWarnings}`,
              inline: true
            },
            {
              name: '🛡️ Protection',
              value: `Anti-spam: ${config[message.guild.id].antiSpam.enabled ? '✅' : '❌'}\n` +
                     `Anti-liens: ${config[message.guild.id].antiLink.enabled ? '✅' : '❌'}\n` +
                     `Anti-invitations: ${config[message.guild.id].antiInvite.enabled ? '✅' : '❌'}`,
              inline: true
            }
          ],
          color: parseInt(config[message.guild.id].embedColor.replace('#', ''), 16),
          timestamp: new Date()
        };

        return message.reply({ embeds: [embed] });
      }

      // Gérer les sous-commandes
      const subCommand = args[0].toLowerCase();
      const value = args.slice(1).join(' ');

      switch (subCommand) {
        case 'prefix':
          if (!value) {
            return message.reply('Veuillez spécifier un préfixe.');
          }
          config[message.guild.id].prefix = value;
          message.reply(`✅ Préfixe défini à "${value}".`);
          break;

        case 'language':
          if (!['fr', 'en'].includes(value)) {
            return message.reply('Langue non supportée. Utilisez "fr" ou "en".');
          }
          config[message.guild.id].defaultLanguage = value;
          message.reply(`✅ Langue définie à "${value}".`);
          break;

        case 'timezone':
          config[message.guild.id].timezone = value;
          message.reply(`✅ Fuseau horaire défini à "${value}".`);
          break;

        case 'color':
          if (!/^#[0-9A-F]{6}$/i.test(value)) {
            return message.reply('Couleur invalide. Utilisez le format hexadécimal (ex: #FF0000).');
          }
          config[message.guild.id].embedColor = value;
          message.reply(`✅ Couleur des embeds définie à "${value}".`);
          break;

        case 'welcome':
          const welcomeChannel = message.mentions.channels.first();
          if (!welcomeChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].welcomeChannel = welcomeChannel.id;
          message.reply(`✅ Canal de bienvenue défini à ${welcomeChannel.name}.`);
          break;

        case 'welcomemessage':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].welcomeMessage = value;
          message.reply('✅ Message de bienvenue mis à jour.');
          break;

        case 'leavemessage':
          if (!value) {
            return message.reply('Veuillez spécifier un message.');
          }
          config[message.guild.id].leaveMessage = value;
          message.reply('✅ Message de départ mis à jour.');
          break;

        case 'autorole':
          const autoRole = message.mentions.roles.first();
          if (!autoRole) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          config[message.guild.id].autoRole = autoRole.id;
          message.reply(`✅ Rôle automatique défini à ${autoRole.name}.`);
          break;

        case 'modrole':
          const modRole = message.mentions.roles.first();
          if (!modRole) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          config[message.guild.id].modRole = modRole.id;
          message.reply(`✅ Rôle modérateur défini à ${modRole.name}.`);
          break;

        case 'adminrole':
          const adminRole = message.mentions.roles.first();
          if (!adminRole) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          config[message.guild.id].adminRole = adminRole.id;
          message.reply(`✅ Rôle admin défini à ${adminRole.name}.`);
          break;

        case 'mutedrole':
          const mutedRole = message.mentions.roles.first();
          if (!mutedRole) {
            return message.reply('Veuillez mentionner un rôle valide.');
          }
          config[message.guild.id].mutedRole = mutedRole.id;
          message.reply(`✅ Rôle muet défini à ${mutedRole.name}.`);
          break;

        case 'logchannel':
          const logChannel = message.mentions.channels.first();
          if (!logChannel) {
            return message.reply('Veuillez mentionner un canal valide.');
          }
          config[message.guild.id].logChannel = logChannel.id;
          message.reply(`✅ Canal de logs défini à ${logChannel.name}.`);
          break;

        case 'maxwarnings':
          const maxWarnings = parseInt(value);
          if (isNaN(maxWarnings) || maxWarnings < 1) {
            return message.reply('Le nombre d\'avertissements doit être un nombre supérieur à 0.');
          }
          config[message.guild.id].maxWarnings = maxWarnings;
          message.reply(`✅ Nombre maximum d'avertissements défini à ${maxWarnings}.`);
          break;

        case 'antispam':
          const [enabled, maxMessages, timeWindow, punishment] = value.split(' ');
          if (!['on', 'off'].includes(enabled)) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'anti-spam.');
          }
          config[message.guild.id].antiSpam.enabled = enabled === 'on';
          if (maxMessages) config[message.guild.id].antiSpam.maxMessages = parseInt(maxMessages);
          if (timeWindow) config[message.guild.id].antiSpam.timeWindow = parseInt(timeWindow);
          if (punishment) config[message.guild.id].antiSpam.punishment = punishment;
          message.reply(`✅ Anti-spam ${enabled === 'on' ? 'activé' : 'désactivé'}.`);
          break;

        case 'antilink':
          const [linkEnabled, linkPunishment] = value.split(' ');
          if (!['on', 'off'].includes(linkEnabled)) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'anti-liens.');
          }
          config[message.guild.id].antiLink.enabled = linkEnabled === 'on';
          if (linkPunishment) config[message.guild.id].antiLink.punishment = linkPunishment;
          message.reply(`✅ Anti-liens ${linkEnabled === 'on' ? 'activé' : 'désactivé'}.`);
          break;

        case 'antiinvite':
          const [inviteEnabled, invitePunishment] = value.split(' ');
          if (!['on', 'off'].includes(inviteEnabled)) {
            return message.reply('Utilisez "on" ou "off" pour activer/désactiver l\'anti-invitations.');
          }
          config[message.guild.id].antiInvite.enabled = inviteEnabled === 'on';
          if (invitePunishment) config[message.guild.id].antiInvite.punishment = invitePunishment;
          message.reply(`✅ Anti-invitations ${inviteEnabled === 'on' ? 'activé' : 'désactivé'}.`);
          break;

        default:
          message.reply('Sous-commande invalide. Utilisez `confighelp` pour voir les commandes disponibles.');
      }

      // Sauvegarder la configuration
      fs.writeFileSync(configFile, JSON.stringify(config, null, 2));
    } catch (error) {
      console.error('Erreur config:', error);
      message.reply('Une erreur est survenue lors de la configuration.');
    }
  }
}; 