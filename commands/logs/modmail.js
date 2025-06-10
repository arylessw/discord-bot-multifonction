const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'modmail',
  description: 'Configure le système de modmail',
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

      if (!config[message.guild.id].modmail) {
        config[message.guild.id].modmail = {
          enabled: false,
          category: null,
          logChannel: null,
          staffRole: null,
          welcomeMessage: 'Bienvenue dans le modmail ! Un membre du staff vous répondra bientôt.',
          closeMessage: 'Ce ticket a été fermé. Vous pouvez en créer un nouveau en envoyant un message au bot.'
        };
      }

      // Créer l'embed de configuration
      const embed = new MessageEmbed()
        .setTitle('⚙️ Configuration du modmail')
        .setDescription('Utilisez les réactions pour configurer les paramètres.')
        .addField('État actuel', config[message.guild.id].modmail.enabled ? '✅ Activé' : '❌ Désactivé', true)
        .addField('Catégorie', config[message.guild.id].modmail.category ? `<#${config[message.guild.id].modmail.category}>` : 'Non configurée', true)
        .addField('Canal de logs', config[message.guild.id].modmail.logChannel ? `<#${config[message.guild.id].modmail.logChannel}>` : 'Non configuré', true)
        .addField('Rôle staff', config[message.guild.id].modmail.staffRole ? `<@&${config[message.guild.id].modmail.staffRole}>` : 'Non configuré', true)
        .addField('Message de bienvenue', config[message.guild.id].modmail.welcomeMessage)
        .addField('Message de fermeture', config[message.guild.id].modmail.closeMessage)
        .setColor(0x00ff00)
        .setFooter('Réagissez avec les émojis pour modifier les paramètres')
        .setTimestamp();

      const settingsMessage = await message.reply({ embeds: [embed] });

      // Ajouter les réactions
      await settingsMessage.react('✅'); // Activer/Désactiver
      await settingsMessage.react('📁'); // Catégorie
      await settingsMessage.react('📝'); // Canal de logs
      await settingsMessage.react('👥'); // Rôle staff
      await settingsMessage.react('👋'); // Message de bienvenue
      await settingsMessage.react('🔒'); // Message de fermeture

      // Créer le collecteur de réactions
      const filter = (reaction, user) => ['✅', '📁', '📝', '👥', '👋', '🔒'].includes(reaction.emoji.name) && user.id === message.author.id;
      const collector = settingsMessage.createReactionCollector({ filter, time: 300000 });

      collector.on('collect', async (reaction, user) => {
        switch (reaction.emoji.name) {
          case '✅':
            config[message.guild.id].modmail.enabled = !config[message.guild.id].modmail.enabled;
            break;
          case '📁':
            message.reply('Mentionnez la catégorie pour les tickets modmail :');
            const categoryFilter = m => m.author.id === message.author.id;
            const categoryCollected = await message.channel.awaitMessages({ categoryFilter, max: 1, time: 30000 });
            if (categoryCollected.first()) {
              const category = categoryCollected.first().mentions.channels.first();
              config[message.guild.id].modmail.category = category ? category.id : null;
            }
            break;
          case '📝':
            message.reply('Mentionnez le canal de logs pour le modmail :');
            const channelFilter = m => m.author.id === message.author.id;
            const channelCollected = await message.channel.awaitMessages({ channelFilter, max: 1, time: 30000 });
            if (channelCollected.first()) {
              const channel = channelCollected.first().mentions.channels.first();
              config[message.guild.id].modmail.logChannel = channel ? channel.id : null;
            }
            break;
          case '👥':
            message.reply('Mentionnez le rôle staff pour le modmail :');
            const roleFilter = m => m.author.id === message.author.id;
            const roleCollected = await message.channel.awaitMessages({ roleFilter, max: 1, time: 30000 });
            if (roleCollected.first()) {
              const role = roleCollected.first().mentions.roles.first();
              config[message.guild.id].modmail.staffRole = role ? role.id : null;
            }
            break;
          case '👋':
            message.reply('Entrez le message de bienvenue pour les tickets modmail :');
            const welcomeFilter = m => m.author.id === message.author.id;
            const welcomeCollected = await message.channel.awaitMessages({ welcomeFilter, max: 1, time: 30000 });
            if (welcomeCollected.first()) {
              config[message.guild.id].modmail.welcomeMessage = welcomeCollected.first().content;
            }
            break;
          case '🔒':
            message.reply('Entrez le message de fermeture pour les tickets modmail :');
            const closeFilter = m => m.author.id === message.author.id;
            const closeCollected = await message.channel.awaitMessages({ closeFilter, max: 1, time: 30000 });
            if (closeCollected.first()) {
              config[message.guild.id].modmail.closeMessage = closeCollected.first().content;
            }
            break;
        }

        // Mettre à jour l'embed
        embed.fields[0].value = config[message.guild.id].modmail.enabled ? '✅ Activé' : '❌ Désactivé';
        embed.fields[1].value = config[message.guild.id].modmail.category ? `<#${config[message.guild.id].modmail.category}>` : 'Non configurée';
        embed.fields[2].value = config[message.guild.id].modmail.logChannel ? `<#${config[message.guild.id].modmail.logChannel}>` : 'Non configuré';
        embed.fields[3].value = config[message.guild.id].modmail.staffRole ? `<@&${config[message.guild.id].modmail.staffRole}>` : 'Non configuré';
        embed.fields[4].value = config[message.guild.id].modmail.welcomeMessage;
        embed.fields[5].value = config[message.guild.id].modmail.closeMessage;

        await settingsMessage.edit({ embeds: [embed] });
        await reaction.users.remove(user.id);
      });

      collector.on('end', () => {
        // Sauvegarder la configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        message.reply('✅ Configuration du modmail sauvegardée !');
      });
    } catch (error) {
      console.error('Erreur lors de la configuration du modmail:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration du modmail.');
    }
  }
};
