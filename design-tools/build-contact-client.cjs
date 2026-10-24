'use strict';
require('esbuild').buildSync({
  entryPoints:[require('node:path').join(__dirname,'contact-bot-client.js')],
  outfile:require('node:path').join(__dirname,'../assets/contact/bot-protection.js'),
  bundle:true, minify:true, platform:'browser', format:'iife', target:['es2022'],
  legalComments:'eof'
});
