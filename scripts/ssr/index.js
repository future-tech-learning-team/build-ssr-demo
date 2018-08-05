
const returnEmpty = function() {
    return null;
};

const path = require('path');
const fs = require('fs');
const ssr = require('../../release/page.generated').default;
const cwd = process.cwd();

let ssrHtml = ssr();

const stylesheets = ['page.css'];
stylesheets.forEach(function(fileName) {
    const content = fs.readFileSync(path.join(cwd, 'release', 'stylesheets', fileName), 'utf8');
    ssrHtml = `<style>\n${content}\n</style>\n${ssrHtml}`;
});

fs.writeFile(path.join(cwd, 'release', 'ssr.html'), ssrHtml, function (err) {
    if (err) {
        console.log(err);
    }
    console.log('write file complete');
});
