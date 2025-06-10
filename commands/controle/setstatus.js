const { requireOwner } = require("../../utils/ownerCheck.js");
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setstatus',
  description: 'Change le statut et l\'activité du bot (réservé aux owners)',
  async execute(message, args, client) {
    // Vérifier que l'utilisateur est owner
    if (!requireOwner(message)) return;

    // Afficher l'aide si aucun argument n'est fourni
    if (!args.length) {
      return message.reply({
        embeds: [{
          title: '📋 Configuration du statut',
          description: 'Cette commande permet de changer le statut et l\'activité du bot.',
          fields: [
            { 
              name: '📝 Syntaxe', 
              value: '`setstatus [status] [type] [activité]`' 
            },
            { 
              name: '🔹 Status', 
              value: '`online` (en ligne)\n`idle` (inactif)\n`dnd` (ne pas déranger)\n`invisible` (invisible)' 
            },
            { 
              name: '🔹 Types d\'activité', 
              value: '`playing` (joue à)\n`watching` (regarde)\n`listening` (écoute)\n`streaming` (streame)\n`competing` (participe à)' 
            },
            { 
              name: '📋 Exemples', 
              value: '`setstatus online playing Minecraft`\n`setstatus dnd watching vous`\n`setstatus idle listening de la musique`' 
            }
          ],
          color: 0x3498DB,
          timestamp: new Date()
        }]
      });
    }

    // Récupérer les arguments
    const status = args[0]?.toLowerCase();
    const type = args[1]?.toLowerCase();
    const activity = args.slice(2).join(' ');

    // Vérifier que le statut est valide
    const validStatuses = ['online', 'idle', 'dnd', 'invisible'];
    if (!validStatuses.includes(status)) {
      return message.reply('❌ Statut invalide. Utilisez: online, idle, dnd ou invisible.');
    }

    // Vérifier que le type d'activité est valide
    const validTypes = ['playing', 'watching', 'listening', 'streaming', 'competing'];
    if (!validTypes.includes(type)) {
      return message.reply('❌ Type d\'activité invalide. Utilisez: playing, watching, listening, streaming ou competing.');
    }

    // Vérifier qu'une activité est spécifiée
    if (!activity) {
      return message.reply('❌ Veuillez spécifier une activité.');
    }

    try {
      // Convertir le type en constante Discord.js
      const activityType = {
        'playing': 0,
        'streaming': 1,
        'listening': 2,
        'watching': 3,
        'competing': 5
      }[type];

      // Définir le statut et l'activité
      await client.user.setPresence({
        status: status,
        activities: [{
          name: activity,
          type: activityType
        }]
      });

      // Sauvegarder dans la configuration
      const configPath = path.join(__dirname, '../../data/config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      
      config.bot.status = status;
      config.bot.activity = {
        type: type.toUpperCase(),
        name: activity
      };
      
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Confirmer le changement
      message.reply({
        embeds: [{
          title: '✅ Statut modifié',
          description: 'Le statut et l\'activité du bot ont été changés avec succès.',
          fields: [
            { name: 'Statut', value: status, inline: true },
            { name: 'Type', value: type, inline: true },
            { name: 'Activité', value: activity, inline: true }
          ],
          color: 0x00FF00,
          timestamp: new Date()
        }]
      });
    } catch (error) {
      console.error('Erreur lors du changement de statut:', error);
      message.reply('❌ Une erreur est survenue lors du changement de statut du bot.');
    }
  }
}; 