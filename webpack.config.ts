import * as path from 'path';
import * as webpack from 'webpack';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import StatoscopePlugin from '@statoscope/webpack-plugin';

import ModuleLogger from './plugins/moduleLogger';

const config: webpack.Configuration = {
    mode: 'production',
    entry: {
        root: './src/pages/root.tsx',
        root2: './src/pages/root2.tsx',
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].[contenthash].js',
    },
    plugins: [
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src/index.html'),
        }),
        new ModuleLogger({
            srcRoot: path.resolve(__dirname, 'src'),
            output: path.resolve(__dirname, 'unused'),
            exclude: [/index\.html/]
        }),
        new StatoscopePlugin({
            saveStatsTo: 'stats.json',
            saveOnlyStats: false,
            open: false,
        })
    ],
    resolve: {
        fallback: {
            "buffer": require.resolve("buffer"),
            "stream": false
        },
        extensions: ['.tsx', '.ts', '.js'],
        alias: {
            'bn.js$': false,
            'crypto-browserify$': path.resolve(__dirname, 'src/randomUUID.ts')
        },
    },
    module: {
        rules: [
            {
                test: /\.(ts|tsx)$/i,
                loader: 'ts-loader',
                exclude: ['/node_modules/'],
            }
        ]
    },
    optimization: {
        minimize: true,
        moduleIds: 'deterministic',
        innerGraph: true,
        concatenateModules: true,
        splitChunks: {
          chunks: 'all',
          minChunks: 2,
          minSize: 0,
          // maxSize: 3 * 1024 * 100,
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
            },           
          },        
        },
    },

    cache: {
        type: 'filesystem',
        buildDependencies: {
            config: [__filename],
        },
    }
};

export default config;