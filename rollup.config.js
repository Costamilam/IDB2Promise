import 'rollup';
import typescript from 'rollup-plugin-typescript2';
import minify from 'rollup-plugin-babel-minify';
import packageConfig from './package.json';

const type = process.env.BUILD;

const outputFields = {
    name: 'IDB2Promise',
    sourcemap: false,
    exports: 'auto'
};

let output = [];

const plugins = [
    typescript({
        rollupCommonJSResolveHack: true,
        clean: true,
        module: 'es5',
        tsconfigOverride: {
            compilerOptions: {
                declaration: true,
                declarationDir: './dist',
                lib: [
                    'es2018',
                    'webworker'
                ]
            },
            include: [
                'src/**/*.ts'
            ]
        }
    })
];

if (type === 'js') {
    output.push({
        ...outputFields,
        file: `dist/${packageConfig.name}.js`,
        format: 'umd'
    });
} else if (type === 'min') {
    output.push({
        ...outputFields,
        file: `dist/${packageConfig.name}.min.js`,
        format: 'umd'
    });

    plugins.push(
        minify({
            sourceMap: true
        })
    );
} else {
    output.push({
        ...outputFields,
        file: packageConfig.module,
        format: 'es'
    });

    output.push({
        ...outputFields,
        file: packageConfig.main,
        format: 'cjs'
    });
}

export default {
    input: 'src/main.ts',
    output: output,
    plugins: plugins
};
