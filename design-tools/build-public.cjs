'use strict';
// Publish the existing website bytes; keep dependencies, server source and
// development documents outside the static output directory.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const output=path.join(root,'public');
fs.rmSync(output,{recursive:true,force:true});
fs.mkdirSync(output,{recursive:true});
for(const entry of fs.readdirSync(root,{withFileTypes:true})) {
  if(entry.isFile() && (/\.(html|css|js|ico|webmanifest|xml)$/i.test(entry.name) ||
      ['robots.txt','brand-tokens.json'].includes(entry.name))) {
    fs.copyFileSync(path.join(root,entry.name),path.join(output,entry.name));
  }
}
for(const name of ['assets','brand'])if(fs.existsSync(path.join(root,name))) {
  fs.cpSync(path.join(root,name),path.join(output,name),{recursive:true});
}
if(!fs.existsSync(path.join(output,'index.html')))throw Error('Homepage output missing');
console.log('PUBLIC_SITE_READY: approved pages and assets copied without modification');
