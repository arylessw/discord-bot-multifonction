const fs = require('fs');
const path = require('path');

function isBlacklisted(userId) {
  const blacklistPath = path.join(__dirname, '../data/blacklist.json');
  const blacklist = JSON.parse(fs.readFileSync(blacklistPath, 'utf8'));
  return blacklist.users.includes(userId);
}

function checkBlacklist(message) {
  if (isBlacklisted(message.author.id)) {
    message.reply('Vous êtes blacklisté du bot.');
    return false;
  }
  return true;
}

module.exports = { isBlacklisted, checkBlacklist }; 