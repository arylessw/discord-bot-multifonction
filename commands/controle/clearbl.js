const fs = require("fs");
const path = require("path");
const { requireOwner } = require("../../utils/ownerCheck.js");

module.exports = {
  name: 'clearbl',
  description: 'Vide la liste des utilisateurs blacklistés',
  async execute(message, args, client) {
    if (!requireOwner(message)) return;

    const blacklistPath = path.join(__dirname, '../../data/blacklist.json');
    const blacklist = { users: [] };
    
    fs.writeFileSync(blacklistPath, JSON.stringify(blacklist, null, 2));
    message.reply('La blacklist a été vidée.');
  }
}; 