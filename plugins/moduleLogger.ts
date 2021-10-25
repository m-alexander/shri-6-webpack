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
            glob(this.options.srcRoot + '/**/*', { nodir: true }, (err, files) => {
                const result = files
                    .map((file) => path.resolve(__dirname, '..' ,file))
                    .filter(file => !usedImports.has(file))
                
                fs.writeFileSync(this.options.output, JSON.stringify(result, null, 2))
            });
        });
    }
}

export default ModuleLogger;