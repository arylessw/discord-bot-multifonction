import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const structure = {
  utilitaire: [
    'changelogs', 'allbots', 'alldadmins', 'botadmins', 'boosters', 'rolemembers', 'serverinfo', 'vocinfo',
    'role', 'channel', 'user', 'member', 'pic', 'banner', 'serverpic', 'serverbanner', 'snipe', 'emoji',
    'image', 'suggestion', 'lbsuggestions', 'wiki', 'searchwiki', 'calc'
  ],
  controle: [
    'set', 'profil', 'theme', 'playto', 'removeactivity', 'status', 'mpsettings', 'serverlist', 'invite',
    'leave', 'discussion', 'mp', 'owner', 'owners', 'unowner', 'clearowners', 'bl', 'showbl', 'unbl',
    'blinfo', 'clearbl', 'say', 'change', 'changeall', 'changereset', 'mainprefix', 'securinvite',
    'helptype', 'alias', 'helpalias', 'setlang', 'langcustom', 'getlang', 'updatebot', 'autoupdate',
    'resetserver', 'resetall'
  ],
  antiraid: [
    'raidlog', 'raiding', 'antitoken', 'antitokenlimit', 'secur', 'antiupdate', 'antichannel', 'antirole',
    'antiroledanger', 'antiwebhook', 'clearwebhooks', 'antiban', 'antieveryone', 'antideco', 'blrank',
    'punition', 'creationlimit', 'wl'
  ],
  gestion: [
    'giveaway', 'endgiveaway', 'reroll', 'choose', 'embed', 'backup', 'backuplist', 'backupdelete',
    'backupload', 'autobackup', 'loading', 'createemoji', 'newsticker', 'massiverole', 'unmassiverole',
    'voicemove', 'voicekick', 'cleanup', 'bringall', 'renew', 'unbanall', 'temprole', 'untemprole',
    'sync', 'openmodmail', 'button', 'autoreact', 'autoreactlist', 'formulaire'
  ],
  config: [
    'perms', 'slowmode', 'autodelete', 'rolemenu', 'ticketsettings', 'claim', 'rename', 'add', 'close',
    'tempvoc', 'tempvoccmd', 'twitch', 'joinsettings', 'leavesettings', 'reminder', 'reminderlist',
    'custom', 'customlist', 'clearcustoms', 'customtransfer', 'restrict', 'soutien', 'setperm',
    'delperm', 'clearperms', 'prefix', 'modmail', 'reportsettings', 'showpics', 'autopublish',
    'suggestionsettings'
  ],
  logs: [
    'settings', 'modlogon', 'modlogoff', 'setmodlogs', 'messagelogon', 'messagelogoff', 'voicelogon',
    'voicelogoff', 'boostlogon', 'boostlogoff', 'rolelogon', 'rolelogoff', 'raidlogon', 'raidlogoff',
    'autoconfiglog', 'joinsettings', 'leavesettings', 'boostembedon', 'setboostembed', 'boostembedtest',
    'modmail', 'nolog'
  ],
  moderation: [
    'sanctions', 'delsanction', 'clearsanctions', 'clearallsanctions', 'clear', 'warn', 'mute', 'tempmute',
    'unmute', 'cmute', 'tempcmte', 'cunmute'
  ]
};

const baseDir = path.join(__dirname, 'commands');

const skeleton = (name, desc) => 
`export default {
  name: '${name}',
  description: '${desc}',
  async execute(message, args, client) {
    message.reply('Commande ${name} à compléter.');
  }
};
`;

for (const [category, commands] of Object.entries(structure)) {
  const dir = path.join(baseDir, category);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const cmd of commands) {
    const file = path.join(dir, `${cmd}.js`);
    if (!fs.existsSync(file)) {
      fs.writeFileSync(file, skeleton(cmd, `Commande ${cmd}`));
    }
  }
}

console.log('Tous les fichiers de commandes ont été générés !');