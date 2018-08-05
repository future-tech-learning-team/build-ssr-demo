/**
 * @since 2017-12-05 14:17
 * @author chenyiqin
 */

const path = require('path');
const prepend = require('prepend-file');
const findUp = require('find-up');
const replace = require('replace-in-file');

const FIXED_FILES = [
    ['page.generated.js'],
];
const FIXED_CODE = `// < HACK >\n
    if (typeof window === 'undefined') {\n
      global.window = {\n
        document: {},\n
        location: {\n
            search: ''\n
        }\n
      };\n
      global.cancelAnimationFrame = function(){};\n
      global.requestAnimationFrame = function(){};\n
      global.setTimeout = function(){};\n
      global.setInterval = function(){};\n
      global.setImmediate = function(){};\n
      global.clearTimeout = function(){};\n
      global.clearInterval = function(){};\n
      global.clearImmediate = function(){};\n
      global.document = {\n
        createElement: function() { return { style: {} }; },\n
        createDocumentFragment: function() { return { appendChild: function(){} }; },\n
        getElementsByTagName: function() { return [ { appendChild: function(){} } ]; }\n
      };\n
    }\n
    // </ HACK >\n\n`;
const prependFiles = [];

function hackJS() {
    findUp('release')
        .then((releasePath) => {
            FIXED_FILES.forEach((FIXED_FILE) => {
                const completeFilePath = path.resolve.apply(path, [releasePath].concat(FIXED_FILE))

                const replaceOptions = {
                    files: completeFilePath,
                    from: /\/\/ < HACK >[\s\S]*?\/\/ <\/ HACK >[\s]*/g,
                    to: '',
                };

                try {
                    const changes = replace.sync(replaceOptions);
                    if (changes.length > 0) {
                        console.log('Remove hack codes from file:\n', changes.join(', '));
                    }
                } catch (error) {
                    console.error('Error occurred:', error);
                }

                prepend(
                    completeFilePath,
                    FIXED_CODE,
                    console.log
                );
                prependFiles.push(completeFilePath);
            });
            console.log('Prepend hack codes to files:\n', prependFiles.join('\n'));
        });
}

console.log('hackJS...')
hackJS();
