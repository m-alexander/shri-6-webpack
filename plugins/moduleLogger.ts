import { Compiler } from 'webpack';
import glob from 'glob'
import * as path from 'path';
import * as fs from 'fs';

class ModuleLogger {

    static defaultOptions = {
        srcRoot: path.resolve(__dirname, '../src'),
        output: path.resolve(__dirname, '../unused')
    };

    options;

    constructor(options = {}) {
        this.options = { ...ModuleLogger.defaultOptions, ...options };
      }

    apply(compiler: Compiler) {
        const usedImports = new Set()
        const extensions = (compiler.options.resolve.extensions)

        compiler.hooks.normalModuleFactory.tap(
            'ModuleLogger',
            (normalModuleFactory) => {
                normalModuleFactory.hooks.module.tap('ModuleLogger', (_module, _createData, resolveData) => {
                    // @ts-ignore
                    const modulePath = _createData.resource;
                    if (modulePath.startsWith(this.options.srcRoot)) {
                        usedImports.add(modulePath)
                    }

                    return _module;
                });


            }
        );

        compiler.hooks.done.tap('ModuleLogger', () => {
            glob(this.options.srcRoot + '/**/*', (err, files) => {
                const result = files.map((file) => {
                    return path.resolve(__dirname, '..' ,file)
                }).filter(file => {
                    const correctExt = extensions.some(ext => file.endsWith(ext))
                    if (!correctExt) return false
                    return !usedImports.has(file)
                })
                
                fs.writeFileSync(this.options.output, JSON.stringify(result, null, 2))
            });
        });
    }
}

export default ModuleLogger;