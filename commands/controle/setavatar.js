const { requireOwner } = require("../../utils/ownerCheck.js");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
  name: 'setavatar',
  description: 'Change l\'avatar du bot (réservé aux owners)',
  async execute(message, args, client) {
    // Vérifier que l'utilisateur est owner
    if (!requireOwner(message)) return;

    // Si une URL est fournie directement, l'utiliser
    if (args[0] && (args[0].startsWith('http://') || args[0].startsWith('https://'))) {
      return this.changeAvatar(message, args[0], client);
    }
    
    // Si une pièce jointe est fournie directement, l'utiliser
    if (message.attachments.size > 0) {
      return this.changeAvatar(message, message.attachments.first().url, client);
    }

    // Sinon, afficher les options avec des boutons
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('url')
          .setLabel('Utiliser une URL')
          .setStyle(ButtonStyle.Primary)
          .setEmoji('🔗'),
        new ButtonBuilder()
          .setCustomId('file')
          .setLabel('Envoyer un fichier')
          .setStyle(ButtonStyle.Success)
          .setEmoji('📁')
      );

    const initialMessage = await message.reply({
      embeds: [{
        title: '🖼️ Changer l\'avatar du bot',
        description: 'Choisissez comment vous souhaitez fournir le nouvel avatar.',
        color: 0x3498DB,
        footer: {
          text: 'Cette commande expirera après 5 minutes d\'inactivité.'
        }
      }],
      components: [row]
    });

    // Créer un collecteur pour les interactions avec les boutons
    const collector = initialMessage.createMessageComponentCollector({
      componentType: ComponentType.Button,
      filter: i => i.user.id === message.author.id,
      time: 300000 // 5 minutes
    });

    collector.on('collect', async interaction => {
      if (interaction.customId === 'url') {
        await interaction.update({
          embeds: [{
            title: '🔗 Entrer une URL',
            description: 'Veuillez entrer l\'URL de l\'image à utiliser comme avatar.\n\nRépondez à ce message avec l\'URL.',
            color: 0x3498DB,
            footer: {
              text: 'Formats supportés: PNG, JPG, GIF, WEBP'
            }
          }],
          components: []
        });

        // Créer un collecteur de messages pour l'URL
        const urlCollector = message.channel.createMessageCollector({
          filter: m => m.author.id === message.author.id,
          max: 1,
          time: 60000 // 1 minute
        });

        urlCollector.on('collect', async m => {
          const url = m.content.trim();
          if (url.startsWith('http://') || url.startsWith('https://')) {
            await this.changeAvatar(message, url, client, initialMessage);
          } else {
            initialMessage.edit({
              embeds: [{
                title: '❌ URL invalide',
                description: 'L\'URL fournie n\'est pas valide. Veuillez réessayer avec une URL valide commençant par http:// ou https://.',
                color: 0xFF0000
              }],
              components: [row]
            });
          }
        });

        urlCollector.on('end', (collected, reason) => {
          if (reason === 'time' && collected.size === 0) {
            initialMessage.edit({
              embeds: [{
                title: '⌛ Temps écoulé',
                description: 'Vous n\'avez pas fourni d\'URL à temps. La commande a été annulée.',
                color: 0xFF0000
              }],
              components: []
            });
          }
        });
      } else if (interaction.customId === 'file') {
        await interaction.update({
          embeds: [{
            title: '📁 Envoyer un fichier',
            description: 'Veuillez téléverser l\'image à utiliser comme avatar.\n\nRépondez à ce message avec une pièce jointe.',
            color: 0x3498DB,
            footer: {
              text: 'Formats supportés: PNG, JPG, GIF, WEBP'
            }
          }],
          components: []
        });

        // Créer un collecteur de messages pour le fichier
        const fileCollector = message.channel.createMessageCollector({
          filter: m => m.author.id === message.author.id && m.attachments.size > 0,
          max: 1,
          time: 60000 // 1 minute
        });

        fileCollector.on('collect', async m => {
          const attachment = m.attachments.first();
          await this.changeAvatar(message, attachment.url, client, initialMessage);
        });

        fileCollector.on('end', (collected, reason) => {
          if (reason === 'time' && collected.size === 0) {
            initialMessage.edit({
              embeds: [{
                title: '⌛ Temps écoulé',
                description: 'Vous n\'avez pas téléversé de fichier à temps. La commande a été annulée.',
                color: 0xFF0000
              }],
              components: []
            });
          }
        });
      }
    });

    collector.on('end', (collected, reason) => {
      if (reason === 'time' && collected.size === 0) {
        initialMessage.edit({
          embeds: [{
            title: '⌛ Temps écoulé',
            description: 'Vous n\'avez pas sélectionné d\'option à temps. La commande a été annulée.',
            color: 0xFF0000
          }],
          components: []
        });
      }
    });
  },

  // Fonction pour changer l'avatar
  async changeAvatar(message, avatarURL, client, initialMessage = null) {
    try {
      // Envoyer un message d'attente si pas de message initial
      const waitMessage = initialMessage || await message.reply('⏳ Changement de l\'avatar en cours...');
      
      // Changer l'avatar du bot
      await client.user.setAvatar(avatarURL);

      // Confirmer le changement
      waitMessage.edit({
        content: '',
        embeds: [{
          title: '✅ Avatar modifié',
          description: 'L\'avatar du bot a été changé avec succès.',
          color: 0x00FF00,
          image: {
            url: avatarURL
          },
          timestamp: new Date()
        }],
        components: []
      });
    } catch (error) {
      console.error('Erreur lors du changement d\'avatar:', error);
      
      // Déterminer quel message modifier
      const targetMessage = initialMessage || message;
      
      // Gérer les erreurs spécifiques
      if (error.code === 50035) {
        targetMessage.reply('❌ Format d\'image non supporté. Utilisez PNG, JPG ou GIF.');
      } else if (error.code === 429) {
        targetMessage.reply('❌ Trop de changements récents. Veuillez réessayer plus tard (limite Discord).');
      } else {
        targetMessage.reply('❌ Une erreur est survenue lors du changement d\'avatar du bot.');
      }
    }
  }
}; 