import { Compiler } from 'webpack';
import glob from 'glob'
import * as path from 'path';
import * as fs from 'fs';

type OptionsType = {
    srcRoot?: string,
    output?: string,
    exclude?: RegExp[];
}

class ModuleLogger {
    options: OptionsType;
    files: Set<string>;

    constructor(options: OptionsType = {}) {
        this.options = {
            srcRoot: path.resolve(__dirname, '../src'),
            output: path.resolve(__dirname, '../unused'),
            exclude: [],
            ...options
        };
      }

    apply(compiler: Compiler) {
        compiler.hooks.normalModuleFactory.tap(
            'ModuleLogger',
            (normalModuleFactory) => {
                normalModuleFactory.hooks.module.tap('ModuleLogger', (_module, _createData, resolveData) => {
                    // @ts-ignore
                    const modulePath = _createData.resource;

                    if (modulePath.startsWith(this.options.srcRoot)) {
                        this.files.delete(modulePath)
                    }

                    return _module;
                });
            }
        );

        compiler.hooks.beforeRun.tapAsync('ModuleLogger', ({}, callback) => {
            glob(this.options.srcRoot + '/**/*', { nodir: true }, (err, files) => {
                this.files = new Set()
                files
                    .map((file) => path.resolve(__dirname, '..' ,file))
                    .filter(file => !this.options.exclude.some(regexp => {
                        return regexp.test(file)
                    }))
                    .forEach(file => this.files.add(file))
                
                callback()
            });
        })

        compiler.hooks.done.tapAsync('ModuleLogger', ({}, callback) => {
            const result = Array.from(this.files)
            fs.writeFileSync(this.options.output, JSON.stringify(result, null, 2))
            callback()
        });
    }
}

export default ModuleLogger;
