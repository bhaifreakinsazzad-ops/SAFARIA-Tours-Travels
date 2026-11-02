// Rebuilds test/site.html (the saved live page + its CSS) with the block injected before </body>.
const fs = require("fs"), path = require("path");
const snap = process.argv[2];
let html = fs.readFileSync(path.join(snap, "page.html"), "utf8");
const css = fs.readFileSync(path.join(snap, "all.css"), "utf8");
html = html.replace(/<link rel="stylesheet" type="text\/css" href="cid:[^"]+" \/>/g, "");
html = html.replace("</head>", "<style>" + css.replace(/<\/style/gi, "<\/style") + "</style></head>");
const block = fs.readFileSync(path.join(__dirname, "..", process.argv[3] || "safaria-motion-block.html"), "utf8");
fs.writeFileSync(path.join(__dirname, "site-original.html"), html);
fs.writeFileSync(path.join(__dirname, "site.html"), html.replace(/<\/body>/i, block + "</body>"));
// Same page as a visitor with motion on (the snapshot was saved with the site's toggle paused).
// Test-only shim: simulate a visitor without prefers-reduced-motion (the preview browser has it on).
const shim = '<script>(function(){var mm=window.matchMedia.bind(window);window.matchMedia=function(q){return /reduced-motion: reduce/.test(q)?{matches:false,media:q,addEventListener:function(){},removeEventListener:function(){},addListener:function(){},removeListener:function(){}}:mm(q)}})();</script>';
const motionHtml = html.replace('data-motion="paused"', 'data-motion="playing"').replace(/prefers-reduced-motion: reduce/g, "prefers-reduced-motion: test-off");
fs.writeFileSync(path.join(__dirname, "site-motion.html"), motionHtml.replace(/<\/body>/i, shim + block + "</body>"));
console.log("ok", (html.length / 1e6).toFixed(2) + " MB");
