const { MessageEmbed } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'setboostembed',
  description: 'Configure les embeds de boost',
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

      if (!config[message.guild.id].boostEmbed) {
        config[message.guild.id].boostEmbed = {
          title: '✨ Nouveau boost !',
          description: '{user} a boosté le serveur !',
          color: '0xf47fff',
          thumbnail: true,
          fields: [
            { name: 'Niveau de boost', value: 'Niveau {level}', inline: true },
            { name: 'Boosts totaux', value: '{count}', inline: true }
          ]
        };
      }

      // Créer l'embed de configuration
      const embed = new MessageEmbed()
        .setTitle('⚙️ Configuration des embeds de boost')
        .setDescription('Utilisez les réactions pour configurer les paramètres.')
        .addField('Titre', config[message.guild.id].boostEmbed.title, true)
        .addField('Description', config[message.guild.id].boostEmbed.description, true)
        .addField('Couleur', config[message.guild.id].boostEmbed.color, true)
        .addField('Miniature', config[message.guild.id].boostEmbed.thumbnail ? '✅ Activée' : '❌ Désactivée', true)
        .addField('Champs', config[message.guild.id].boostEmbed.fields.map(f => `${f.name}: ${f.value}`).join('\n'))
        .setColor(0x00ff00)
        .setFooter('Réagissez avec les émojis pour modifier les paramètres')
        .setTimestamp();

      const settingsMessage = await message.reply({ embeds: [embed] });

      // Ajouter les réactions
      await settingsMessage.react('📝'); // Titre
      await settingsMessage.react('📄'); // Description
      await settingsMessage.react('🎨'); // Couleur
      await settingsMessage.react('🖼️'); // Miniature
      await settingsMessage.react('➕'); // Ajouter un champ
      await settingsMessage.react('➖'); // Supprimer un champ

      // Créer le collecteur de réactions
      const filter = (reaction, user) => ['📝', '📄', '🎨', '🖼️', '➕', '➖'].includes(reaction.emoji.name) && user.id === message.author.id;
      const collector = settingsMessage.createReactionCollector({ filter, time: 300000 });

      collector.on('collect', async (reaction, user) => {
        switch (reaction.emoji.name) {
          case '📝':
            message.reply('Entrez le nouveau titre pour l\'embed de boost :');
            const titleFilter = m => m.author.id === message.author.id;
            const titleCollected = await message.channel.awaitMessages({ titleFilter, max: 1, time: 30000 });
            if (titleCollected.first()) {
              config[message.guild.id].boostEmbed.title = titleCollected.first().content;
            }
            break;
          case '📄':
            message.reply('Entrez la nouvelle description pour l\'embed de boost (utilisez {user} pour le nom d\'utilisateur) :');
            const descFilter = m => m.author.id === message.author.id;
            const descCollected = await message.channel.awaitMessages({ descFilter, max: 1, time: 30000 });
            if (descCollected.first()) {
              config[message.guild.id].boostEmbed.description = descCollected.first().content;
            }
            break;
          case '🎨':
            message.reply('Entrez la nouvelle couleur pour l\'embed de boost (format hexadécimal, ex: #f47fff) :');
            const colorFilter = m => m.author.id === message.author.id;
            const colorCollected = await message.channel.awaitMessages({ colorFilter, max: 1, time: 30000 });
            if (colorCollected.first()) {
              const color = colorCollected.first().content.replace('#', '0x');
              config[message.guild.id].boostEmbed.color = color;
            }
            break;
          case '🖼️':
            config[message.guild.id].boostEmbed.thumbnail = !config[message.guild.id].boostEmbed.thumbnail;
            break;
          case '➕':
            message.reply('Entrez le nom du nouveau champ :');
            const nameFilter = m => m.author.id === message.author.id;
            const nameCollected = await message.channel.awaitMessages({ nameFilter, max: 1, time: 30000 });
            if (nameCollected.first()) {
              message.reply('Entrez la valeur du nouveau champ (utilisez {level} pour le niveau de boost et {count} pour le nombre total de boosts) :');
              const valueFilter = m => m.author.id === message.author.id;
              const valueCollected = await message.channel.awaitMessages({ valueFilter, max: 1, time: 30000 });
              if (valueCollected.first()) {
                config[message.guild.id].boostEmbed.fields.push({
                  name: nameCollected.first().content,
                  value: valueCollected.first().content,
                  inline: true
                });
              }
            }
            break;
          case '➖':
            if (config[message.guild.id].boostEmbed.fields.length > 0) {
              config[message.guild.id].boostEmbed.fields.pop();
            }
            break;
        }

        // Mettre à jour l'embed
        embed.fields[0].value = config[message.guild.id].boostEmbed.title;
        embed.fields[1].value = config[message.guild.id].boostEmbed.description;
        embed.fields[2].value = config[message.guild.id].boostEmbed.color;
        embed.fields[3].value = config[message.guild.id].boostEmbed.thumbnail ? '✅ Activée' : '❌ Désactivée';
        embed.fields[4].value = config[message.guild.id].boostEmbed.fields.map(f => `${f.name}: ${f.value}`).join('\n');

        await settingsMessage.edit({ embeds: [embed] });
        await reaction.users.remove(user.id);
      });

      collector.on('end', () => {
        // Sauvegarder la configuration
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
        message.reply('✅ Configuration des embeds de boost sauvegardée !');
      });
    } catch (error) {
      console.error('Erreur lors de la configuration des embeds de boost:', error);
      message.reply('❌ Une erreur est survenue lors de la configuration des embeds de boost.');
    }
  }
};
