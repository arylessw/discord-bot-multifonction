const { PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'help',
  description: 'Affiche la liste des commandes disponibles',
  async execute(message, args, client) {
    try {
      if (!message.guild.members.me.permissions.has(PermissionFlagsBits.SendMessages)) {
        return console.error('Le bot n\'a pas la permission d\'envoyer des messages.');
      }

      const prefix = client.config.prefixes.default;
      const guildPrefix = message.guild && client.config.prefixes.custom[message.guild.id] 
        ? client.config.prefixes.custom[message.guild.id] 
        : prefix;

      // Si une commande spécifique est demandée
      if (args[0]) {
        // Si l'utilisateur demande toutes les commandes
        if (args[0].toLowerCase() === 'all' || args[0].toLowerCase() === 'toutes') {
          // Trier les commandes par nom
          const sortedCommands = [...client.commands.values()].sort((a, b) => a.name.localeCompare(b.name));
          
          // Diviser les commandes en pages (maximum 10 commandes par page)
          const commandsPerPage = 10;
          const pages = [];
          
          for (let i = 0; i < sortedCommands.length; i += commandsPerPage) {
            pages.push(sortedCommands.slice(i, i + commandsPerPage));
          }
          
          let currentPage = 0;
          
          // Créer l'embed pour la page actuelle
          const createAllCommandsEmbed = () => {
            const embed = new EmbedBuilder()
              .setColor(0x3498DB)
              .setTitle('📖 Liste de toutes les commandes')
              .setDescription(`Voici toutes les commandes disponibles (${client.commands.size} au total).`)
              .setFooter({ 
                text: `Page ${currentPage + 1}/${pages.length} • Utilisez ${guildPrefix}help <commande> pour plus de détails` 
              })
              .setTimestamp();
            
            // Ajouter chaque commande de la page actuelle
            pages[currentPage].forEach(cmd => {
              embed.addFields({
                name: `${guildPrefix}${cmd.name}`,
                value: cmd.description || 'Aucune description disponible',
                inline: false
              });
            });
            
            return embed;
          };
          
          // Créer les boutons de navigation
          const createNavigationRow = () => {
            return new ActionRowBuilder()
              .addComponents(
                new ButtonBuilder()
                  .setCustomId('prev')
                  .setLabel('◀️ Précédent')
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(currentPage === 0),
                new ButtonBuilder()
                  .setCustomId('next')
                  .setLabel('Suivant ▶️')
                  .setStyle(ButtonStyle.Primary)
                  .setDisabled(currentPage === pages.length - 1)
              );
          };
          
          // Envoyer le premier embed
          const helpMessage = await message.reply({
            embeds: [createAllCommandsEmbed()],
            components: [createNavigationRow()]
          });
          
          // Créer le collecteur de boutons
          const collector = helpMessage.createMessageComponentCollector({
            filter: i => i.user.id === message.author.id,
            time: 180000 // 3 minutes
          });
          
          collector.on('collect', async (interaction) => {
            if (interaction.customId === 'prev' && currentPage > 0) {
              currentPage--;
            } else if (interaction.customId === 'next' && currentPage < pages.length - 1) {
              currentPage++;
            }
            
            await interaction.update({
              embeds: [createAllCommandsEmbed()],
              components: [createNavigationRow()]
            });
          });
          
          collector.on('end', () => {
            // Désactiver les boutons à la fin
            const disabledRow = createNavigationRow();
            disabledRow.components.forEach(button => button.setDisabled(true));
            helpMessage.edit({ components: [disabledRow] }).catch(console.error);
          });
          
          return;
        }

        const commandName = args[0].toLowerCase();
        const command = client.commands.get(commandName);
        
        if (!command) {
          return message.reply({ 
            embeds: [
              new EmbedBuilder()
                .setColor(0xFF0000)
                .setTitle('❌ Commande introuvable')
                .setDescription(`La commande \`${commandName}\` n'existe pas.`)
                .setFooter({ text: `Utilisez ${guildPrefix}help pour voir la liste des commandes disponibles.` })
                .setTimestamp()
            ] 
          });
        }
        
        // Créer un embed pour la commande spécifique
        const commandEmbed = new EmbedBuilder()
          .setColor(0x3498DB)
          .setTitle(`📖 Aide: ${command.name}`)
          .setDescription(command.description || 'Aucune description disponible')
          .addFields(
            { name: '📝 Utilisation', value: `\`${guildPrefix}${command.name}\`` + (command.usage ? ` ${command.usage}` : '') }
          )
          .setFooter({ text: `Utilisez ${guildPrefix}help pour voir la liste des commandes disponibles.` })
          .setTimestamp();
        
        return message.reply({ embeds: [commandEmbed] });
      }

      // Créer des catégories basées sur les dossiers du répertoire commands
      const categories = {};
      
      // Parcourir les dossiers de commandes pour créer les catégories
      const commandsPath = path.join(__dirname, '../../commands');
      const folders = fs.readdirSync(commandsPath).filter(folder => 
        fs.statSync(path.join(commandsPath, folder)).isDirectory()
      );
      
      // Créer une catégorie pour chaque dossier, en mettant la première lettre en majuscule
      folders.forEach(folder => {
        const categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
        categories[categoryName] = [];
      });
      
      // Remplir les catégories avec les commandes correspondantes
      folders.forEach(folder => {
        const folderPath = path.join(commandsPath, folder);
        const commandFiles = fs.readdirSync(folderPath).filter(file => file.endsWith('.js'));
        
        const categoryName = folder.charAt(0).toUpperCase() + folder.slice(1);
        
        for (const file of commandFiles) {
          const commandName = file.replace('.js', '');
          const command = client.commands.get(commandName);
          
          if (command) {
            categories[categoryName].push(command);
          }
        }
      });

      // Filtrer les catégories vides
      Object.keys(categories).forEach(category => {
        if (categories[category].length === 0) {
          delete categories[category];
        }
      });

      // Créer des pages pour chaque catégorie
      const categoryNames = Object.keys(categories);
      
      // Vérifier si des catégories ont été trouvées
      if (categoryNames.length === 0) {
        return message.reply({ 
          embeds: [
            new EmbedBuilder()
              .setColor(0xFF0000)
              .setTitle('❌ Erreur')
              .setDescription('Aucune commande n\'a été trouvée. Contactez un administrateur.')
              .setTimestamp()
          ]
        });
      }
      
      let currentPage = 0;

      // Créer les boutons de navigation
      const createNavigationRow = () => {
        return new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('prev')
              .setLabel('◀️ Précédent')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === 0),
            new ButtonBuilder()
              .setCustomId('next')
              .setLabel('Suivant ▶️')
              .setStyle(ButtonStyle.Primary)
              .setDisabled(currentPage === categoryNames.length - 1)
          );
      };

      // Fonction pour créer l'embed d'une page (catégorie)
      const createPageEmbed = () => {
        const categoryName = categoryNames[currentPage];
        const commands = categories[categoryName];
        
        const embed = new EmbedBuilder()
          .setColor(getCategoryColor(categoryName))
          .setTitle(`${getCategoryEmoji(categoryName)} ${categoryName}`)
          .setDescription(`Liste des commandes de la catégorie **${categoryName}**`)
          .setFooter({ 
            text: `Page ${currentPage + 1}/${categoryNames.length} • Utilisez ${guildPrefix}help <commande> pour plus de détails` 
          })
          .setTimestamp();
        
        // Limiter le nombre de commandes affichées à 20 pour éviter l'erreur
        const MAX_FIELDS = 20;
        const displayCommands = commands.slice(0, MAX_FIELDS);
        
        // Ajouter les commandes à l'embed
        displayCommands.forEach(cmd => {
          embed.addFields({
            name: `${guildPrefix}${cmd.name}`,
            value: cmd.description || 'Aucune description disponible',
            inline: false
          });
        });
        
        // Si il y a plus de commandes que la limite, ajouter une note
        if (commands.length > MAX_FIELDS) {
          embed.addFields({
            name: '⚠️ Note',
            value: `Cette catégorie contient ${commands.length} commandes. Seules les ${MAX_FIELDS} premières sont affichées.`,
            inline: false
          });
        }
        
        return embed;
      };

      // Envoyer le premier embed
      const helpMessage = await message.reply({
        embeds: [createPageEmbed()],
        components: [createNavigationRow()]
      });

      // Créer le collecteur de boutons
      const collector = helpMessage.createMessageComponentCollector({
        filter: i => i.user.id === message.author.id,
        time: 180000 // 3 minutes
      });

      collector.on('collect', async (interaction) => {
        if (interaction.customId === 'prev' && currentPage > 0) {
          currentPage--;
        } else if (interaction.customId === 'next' && currentPage < categoryNames.length - 1) {
          currentPage++;
        }
        
        await interaction.update({
          embeds: [createPageEmbed()],
          components: [createNavigationRow()]
        });
      });

      collector.on('end', () => {
        // Désactiver les boutons à la fin
        const disabledRow = createNavigationRow();
        disabledRow.components.forEach(button => button.setDisabled(true));
        helpMessage.edit({ components: [disabledRow] }).catch(console.error);
      });

    } catch (error) {
      console.error('Erreur lors de l\'affichage de l\'aide:', error);
      message.reply({ 
        embeds: [
          new EmbedBuilder()
            .setColor(0xFF0000)
            .setTitle('❌ Erreur')
            .setDescription('Une erreur est survenue lors de l\'affichage de l\'aide.')
            .setTimestamp()
        ]
      });
    }
  }
};

// Fonction pour obtenir l'emoji correspondant à la catégorie
function getCategoryEmoji(category) {
  const emojis = {
    'Antiraid': '🛡️',
    'Config': '⚙️',
    'Controle': '🔐',
    'Gestion': '📊',
    'Logs': '📝',
    'Moderation': '🛡️',
    'Utilitaire': '🔧'
  };
  return emojis[category] || '📋';
}

// Fonction pour obtenir la couleur correspondant à la catégorie
function getCategoryColor(category) {
  const colors = {
    'Antiraid': 0xFF0000,
    'Config': 0x2ECC71,
    'Controle': 0x7289DA,
    'Gestion': 0x34495E,
    'Logs': 0x9B59B6,
    'Moderation': 0xE74C3C,
    'Utilitaire': 0x1ABC9C
  };
  return colors[category] || 0x95A5A6;
} 