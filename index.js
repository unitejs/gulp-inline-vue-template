const path = require('path');
const fs = require('fs');
const through = require('through2');
const gutil = require('gulp-util');
const compiler = require('vue-template-compiler');
const transpile = require('vue-template-es2015-compiler');

const PLUGIN_NAME = 'gulp-inline-vue-template';

function gulpInlineVue(options) {
    return through.obj(function (file, encode, callback) {
        if (file.isNull()) {
            return callback(null, file);
        }
        if (file.isStream()) {
            this.emit('error', new PluginError(PLUGIN_NAME, 'Streams are not supported'));
            return callback();
        }

        const contents = file.contents.toString();
        const templateUrlMatch = /([\"\'`]?template[\"\'`]?:(?:.*?))[\"\'`](.*)\.vue[\"\'`]/i.exec(contents);
        if (templateUrlMatch) {
            const templatePath = path.join(path.dirname(file.path), `${templateUrlMatch[2]}.vue`);

            fs.readFile(templatePath, (err, data) => {
                if (err) {
                    this.emit('error', new gutil.PluginError(PLUGIN_NAME, `from ${PLUGIN_NAME} in file ${file.path}:\n   ${err.message}`));
                    return callback();
                }

                const templateContents = /<template>([\s\S]*)<\/template>/i.exec(data.toString())

                if (templateContents) {
                    const toFunction = code => {
                        code = transpile(`function render(){${code}}`)
                        code = code.replace(/^function render\(\)\{|\}$/g, '')
                        return new Function(code)
                    }

                    const res = compiler.compile(templateContents[1]);
                    let replaceWith = `render: ${toFunction(res.render)}`;
                    if (res.staticRenderFns.length > 0) {
                        replaceWith += `,\r\nstaticRenderFns: [${res.staticRenderFns.map(toFunction)}]`;
                    }
                    file.contents = new Buffer(contents.replace(templateUrlMatch[0], replaceWith));
                    callback(null, file);
                } else {
                    this.emit('error', new gutil.PluginError(PLUGIN_NAME, `from ${PLUGIN_NAME} in file ${file.path}:\n   Could not extract the <template></template> tags in the file ${templatePath}`));
                    return callback();
                }
            });
        } else {
            callback(null, file);
        }
    });
}

module.exports = gulpInlineVue;