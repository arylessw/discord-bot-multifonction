const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'joinsettings',
  description: 'Configure les paramètres des logs d\'arrivée',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    try {
      const configPath = path.join(__dirname, '../../config/server_config.json');
      let config = {};
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      if (!config[message.guild.id].joinSettings) {
        config[message.guild.id].joinSettings = {
          enabled: true,
          sendDM: false,
          message: 'Bienvenue {user} sur {server} !',
          role: null
        };
      }

      // Créer l'embed de configuration
      const embed = new MessageEmbed()
        .setTitle('⚙️ Configuration des logs d\'arrivée')
        .setDescription('Utilisez les réactions pour configurer les paramètres.')
        .addField('État actuel', config[message.guild.id].joinSettings.enabled ? '✅ Activé' : '❌ Désactivé', true)
        .addField('Message DM', config[message.guild.id].joinSettings.sendDM ? '✅ Activé' : '❌ Désactivé', true)
        .addField('Message de bienvenue', config[message.guild.id].joinSettings.message)
        .addField('Rôle automatique', config[message.guild.id].joinSettings.role ? `<@&${config[message.guild.id].joinSettings.role}>` : 'Aucun')
        .setColor(0x00ff00)
        .setFooter('Réagissez avec les émojis pour modifier les paramètres')
        .setTimestamp();

      const settingsMessage = await message.reply({ embeds: [embed] });

      // Ajouter les réactions
      await settingsMessage.react('✅'); // Activer/Désactiver
      await settingsMessage.react('📨'); // Message DM
      await settingsMessage.react('📝'); // Message de bienvenue
      await settingsMessage.react('👥'); // Rôle automatique

      // Créer le collecteur de réactions
      const filter = (reaction, user) => ['✅', '📨', '📝', '👥'].includes(reaction.emoji.name) && user.id === message.author.id;
      const collector = settingsMessage.createReactionCollector({ filter, time: 300000 });

      collector.on('collect', async (reaction, user) => {
        switch (reaction.emoji.name) {
          case '✅':
            config[message.guild.id].joinSettings.enabled = !config[message.guild.id].joinSettings.enabled;
            break;
          case '📨':
            config[message.guild.id].joinSettings.sendDM = !config[message.guild.id].joinSettings.sendDM;
            break;
          case '📝':
            message.reply('Entrez le nouveau message de bienvenue (utilisez {user} pour le nom d\'utilisateur et {server} pour le nom du serveur) :');
            const filter = m => m.author.id === message.author.id;
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            if (collected.first()) {
              config[message.guild.id].joinSettings.message = collected.first().content;
            }
            break;
          case '👥':
            message.reply('Mentionnez le rôle à attribuer automatiquement (ou écrivez "aucun" pour désactiver) :');
            const roleFilter = m => m.author.id === message.author.id;
            const roleCollected = await message.channel.awaitMessages({ roleFilter, max: 1, time: 30000 });
            if (roleCollected.first()) {
              const role = roleCollected.first().mentions.roles.first();
              config[message.guild.id].joinSettings.role = role ? role.id : null;
            }
            break;
        }

        // Mettre à jour l'embed
        embed.fields[0].value = config[message.guild.id].joinSettings.enabled ? '✅ Activé' : '❌ Désactivé';
        embed.fields[1].value = config[message.guild.id].joinSettings.sendDM ? '✅ Activé' : '❌ Désactivé';
        embed.fields[2].value = config[message.guild.id].joinSettings.message;
        embed.fields[3].value = config[message.guild.id].joinSettings.role ? `<@&${config[message.guild.id].joinSettings.role}>` : 'Aucun';

        await settingsMessage.edit({ embeds: [embed] });
        await reaction.users.remove(user.id);
      });

      collector.on('end', () => {
        // Sauvegarder la configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        message.reply('✅ Configuration des logs d\'arrivée sauvegardée !');
      });
    } catch (error) {
      console.error('Erreur lors de la configuration des logs d\'arrivée:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration des logs d\'arrivée.');
    }
  }
};
