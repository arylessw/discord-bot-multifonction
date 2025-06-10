const fs = require("fs");
const path = require("path");
const { fileURLToPath } = require("url");




const languages = {
  fr: 'Français',
  en: 'English',
  es: 'Español',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
  ko: '한국어',
  zh: '中文'
};

module.exports = {
  name: 'language',
  description: 'Change la langue du bot',
  async execute(message, args, client) {
    if (!message.guild) {
      return message.reply('Cette commande doit être utilisée dans un serveur.');
    }

    if (!message.member.permissions.has('ADMINISTRATOR')) {
      return message.reply('Vous n\'avez pas la permission de changer la langue.');
    }

    if (!args[0]) {
      const configPath = path.join(__dirname, '../../data/config.json');
      let config = {};
      
      try {
        if (fs.existsSync(configPath)) {
          config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }

        const currentLang = config[message.guild.id]?.language || 'fr';
        const embed = {
          title: 'Langue actuelle',
          description: `La langue actuelle est: \`${languages[currentLang]}\`\n\nLangues disponibles:\n${Object.entries(languages).map(([code, name]) => `\`${code}\` - ${name}`).join('\n')}`,
          color: 0x00ff00,
          timestamp: new Date()
        };

        message.reply({ embeds: [embed] });
      } catch (error) {
        message.reply('Une erreur est survenue lors de la récupération de la langue.');
      }
      return;
    }

    const newLang = args[0].toLowerCase();
    if (!languages[newLang]) {
      return message.reply('Langue non supportée. Utilisez la commande sans argument pour voir les langues disponibles.');
    }

    const configPath = path.join(__dirname, '../../data/config.json');
    let config = {};
    
    try {
      if (fs.existsSync(configPath)) {
        config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
      }

      if (!config[message.guild.id]) {
        config[message.guild.id] = {};
      }

      config[message.guild.id].language = newLang;
      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      client.language = newLang;

      const embed = {
        title: 'Langue modifiée',
        description: `La langue a été changée en: \`${languages[newLang]}\``,
        color: 0x00ff00,
        timestamp: new Date()
      };

      message.reply({ embeds: [embed] });
    } catch (error) {
      message.reply('Une erreur est survenue lors du changement de la langue.');
    }
  }
}; 