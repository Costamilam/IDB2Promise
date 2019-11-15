'use strict';

import 'rollup';
import typescript from 'rollup-plugin-typescript';
import buble from 'rollup-plugin-buble';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from 'rollup-plugin-node-resolve';
import minify from 'rollup-plugin-babel-minify';

// Default/development Build
const config = {
    input: 'src/main.ts',
    external: [ ],
    output: [{
        name: 'IDB2Promise',
        file: 'build/idb2promise.js',
        format: 'umd',
        moduleName: 'IDB2Promise',
        sourceMap: true,
        exports: 'auto'
    }],
    plugins: [
        typescript({
            typescript: require('typescript')
        }),
        buble({
            transforms: {
                generator: false,
                forOf: false
            }
        }),
        nodeResolve({
            mainFields: ['main']
        }),
        commonjs({
            namedExports: { }
        })
    ]
};

// Minified JS Build
if (process.env.BUILD === 'minify') {
    config.output = [{
        name: 'IDB2Promise',
        file: 'build/idb2promise.min.js',
        format: 'umd',
        moduleName: 'IDB2Promise',
        sourceMap: true,
        exports: 'auto'
    }];

    config.plugins.push(
		minify({
            sourceMap: true
        })
    );
}

export default config;
