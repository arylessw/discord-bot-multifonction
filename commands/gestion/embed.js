const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'embed',
  description: 'Crée un embed personnalisé avec une interface interactive',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('Administrator')) {
      return message.reply('Vous devez être administrateur pour utiliser cette commande.');
    }

    // Créer un embed vide
    const embed = new EmbedBuilder()
      .setColor('#0099ff')
      .setDescription('Cliquez sur les boutons ci-dessous pour personnaliser cet embed.')
      .setTimestamp();

    // Créer les boutons
    const row1 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('title')
          .setLabel('📝')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('description')
          .setLabel('📄')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('color')
          .setLabel('🎨')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('thumbnail')
          .setLabel('🖼️')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('image')
          .setLabel('🖼')
          .setStyle(ButtonStyle.Primary)
      );

    const row2 = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('add_field')
          .setLabel('➕')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('remove_field')
          .setLabel('➖')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('footer')
          .setLabel('📌')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('preview')
          .setLabel('👁️')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('send')
          .setLabel('✅')
          .setStyle(ButtonStyle.Danger)
      );

    // Envoyer le message initial
    const embedMessage = await message.channel.send({
      content: 'Utilisez les boutons ci-dessous pour personnaliser votre embed :',
      embeds: [embed],
      components: [row1, row2]
    });

    // Créer le collecteur de boutons
    const filter = i => i.user.id === message.author.id;
    const collector = embedMessage.createMessageComponentCollector({ filter, time: 300000 });

    collector.on('collect', async interaction => {
      switch (interaction.customId) {
        case 'title': {
          await interaction.reply({
            content: 'Veuillez entrer le titre de l\'embed :',
            ephemeral: true
          });

          const filter = m => m.author.id === message.author.id;
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
          const title = collected.first()?.content;

          if (title) {
            embed.setTitle(title);
            await embedMessage.edit({ embeds: [embed] });
          }
          break;
        }

        case 'description': {
          await interaction.reply({
            content: 'Veuillez entrer la description de l\'embed :',
            ephemeral: true
          });

          const filter = m => m.author.id === message.author.id;
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
          const description = collected.first()?.content;

          if (description) {
            embed.setDescription(description);
            await embedMessage.edit({ embeds: [embed] });
          }
          break;
        }

        case 'color': {
          await interaction.reply({
            content: 'Veuillez entrer la couleur de l\'embed (format hexadécimal, ex: #FF0000) :',
            ephemeral: true
          });

          const filter = m => m.author.id === message.author.id && /^#[0-9A-F]{6}$/i.test(m.content);
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
          const color = collected.first()?.content;

          if (color) {
            embed.setColor(color);
            await embedMessage.edit({ embeds: [embed] });
          }
          break;
        }

        case 'thumbnail': {
          await interaction.reply({
            content: 'Veuillez entrer l\'URL de la miniature :',
            ephemeral: true
          });

          const filter = m => m.author.id === message.author.id;
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
          const thumbnail = collected.first()?.content;

          if (thumbnail) {
            embed.setThumbnail(thumbnail);
            await embedMessage.edit({ embeds: [embed] });
          }
          break;
        }

        case 'image': {
          await interaction.reply({
            content: 'Veuillez entrer l\'URL de l\'image :',
            ephemeral: true
          });

          const filter = m => m.author.id === message.author.id;
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
          const image = collected.first()?.content;

          if (image) {
            embed.setImage(image);
            await embedMessage.edit({ embeds: [embed] });
          }
          break;
        }

        case 'add_field': {
          await interaction.reply({
            content: 'Veuillez entrer le nom du champ :',
            ephemeral: true
          });

          const filter = m => m.author.id === message.author.id;
          const nameCollected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
          const name = nameCollected.first()?.content;

          if (name) {
            await message.channel.send('Veuillez entrer la valeur du champ :');
            const valueCollected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
            const value = valueCollected.first()?.content;

            if (value) {
              embed.addField(name, value);
              await embedMessage.edit({ embeds: [embed] });
            }
          }
          break;
        }

        case 'remove_field': {
          if (embed.fields.length === 0) {
            await interaction.reply({
              content: 'Il n\'y a aucun champ à supprimer.',
              ephemeral: true
            });
            return;
          }

          const options = embed.fields.map((field, index) => ({
            label: field.name,
            value: index.toString()
          }));

          const row = new ActionRowBuilder()
            .addComponents(
              new ButtonBuilder()
                .setCustomId('field_select')
                .setPlaceholder('Sélectionnez un champ à supprimer')
                .addOptions(options)
            );

          await interaction.reply({
            content: 'Sélectionnez le champ à supprimer :',
            components: [row],
            ephemeral: true
          });

          const filter = i => i.user.id === message.author.id && i.customId === 'field_select';
          const selectInteraction = await embedMessage.awaitMessageComponent({ filter, time: 30000 });
          const fieldIndex = parseInt(selectInteraction.values[0]);

          embed.spliceFields(fieldIndex, 1);
          await embedMessage.edit({ embeds: [embed] });
          break;
        }

        case 'footer': {
          await interaction.reply({
            content: 'Veuillez entrer le texte du pied de page :',
            ephemeral: true
          });

          const filter = m => m.author.id === message.author.id;
          const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000 });
          const footer = collected.first()?.content;

          if (footer) {
            embed.setFooter({ text: footer });
            await embedMessage.edit({ embeds: [embed] });
          }
          break;
        }

        case 'preview': {
          await interaction.reply({
            content: 'Voici la prévisualisation de votre embed :',
            embeds: [embed],
            ephemeral: true
          });
          break;
        }

        case 'send': {
          await message.channel.send({ embeds: [embed] });
          await interaction.reply({
            content: 'L\'embed a été envoyé avec succès !',
            ephemeral: true
          });
          await embedMessage.delete().catch(console.error);
          collector.stop();
          break;
        }
      }
    });

    collector.on('end', () => {
      if (!embedMessage.deleted) {
        embedMessage.edit({
          content: 'Le temps est écoulé. Créez un nouvel embed avec la commande !embed',
          components: []
        }).catch(console.error);
      }
    });
  }
}; 