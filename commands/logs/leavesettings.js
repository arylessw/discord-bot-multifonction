const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'leavesettings',
  description: 'Configure les paramètres des logs de départ',
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

      if (!config[message.guild.id].leaveSettings) {
        config[message.guild.id].leaveSettings = {
          enabled: true,
          message: 'Au revoir {user} ! Nous espérons te revoir bientôt sur {server}.'
        };
      }

      // Créer l'embed de configuration
      const embed = new MessageEmbed()
        .setTitle('⚙️ Configuration des logs de départ')
        .setDescription('Utilisez les réactions pour configurer les paramètres.')
        .addField('État actuel', config[message.guild.id].leaveSettings.enabled ? '✅ Activé' : '❌ Désactivé', true)
        .addField('Message de départ', config[message.guild.id].leaveSettings.message)
        .setColor(0x00ff00)
        .setFooter('Réagissez avec les émojis pour modifier les paramètres')
        .setTimestamp();

      const settingsMessage = await message.reply({ embeds: [embed] });

      // Ajouter les réactions
      await settingsMessage.react('✅'); // Activer/Désactiver
      await settingsMessage.react('📝'); // Message de départ

      // Créer le collecteur de réactions
      const filter = (reaction, user) => ['✅', '📝'].includes(reaction.emoji.name) && user.id === message.author.id;
      const collector = settingsMessage.createReactionCollector({ filter, time: 300000 });

      collector.on('collect', async (reaction, user) => {
        switch (reaction.emoji.name) {
          case '✅':
            config[message.guild.id].leaveSettings.enabled = !config[message.guild.id].leaveSettings.enabled;
            break;
          case '📝':
            message.reply('Entrez le nouveau message de départ (utilisez {user} pour le nom d\'utilisateur et {server} pour le nom du serveur) :');
            const filter = m => m.author.id === message.author.id;
            const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            if (collected.first()) {
              config[message.guild.id].leaveSettings.message = collected.first().content;
            }
            break;
        }

        // Mettre à jour l'embed
        embed.fields[0].value = config[message.guild.id].leaveSettings.enabled ? '✅ Activé' : '❌ Désactivé';
        embed.fields[1].value = config[message.guild.id].leaveSettings.message;

        await settingsMessage.edit({ embeds: [embed] });
        await reaction.users.remove(user.id);
      });

      collector.on('end', () => {
        // Sauvegarder la configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        message.reply('✅ Configuration des logs de départ sauvegardée !');
      });
    } catch (error) {
      console.error('Erreur lors de la configuration des logs de départ:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration des logs de départ.');
    }
  }
};
