import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import peerDepsExternal from 'rollup-plugin-peer-deps-external';
import typescript from '@rollup/plugin-typescript';
import postcss from 'rollup-plugin-postcss';
import svg from 'rollup-plugin-svg';
import babel from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';

import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

export default [
  {
    input: './index.tsx',
    output: {
      file: pkg.main,
      format: 'esm',
    },
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs({ transformMixedEsModules: true }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'lib',
        rootDir: '.',
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      postcss({
        extensions: ['.css', '.less'],
        extract: 'style.css',
        minimize: false,
        use: [
          ['less', { javascriptEnabled: true }]
        ],
      }),
      svg(),
    ],
  },
  {
    input: './index.tsx',
    output: [
      {
        file: 'dist/quill-react-pro.min.js',
        format: 'umd',
        sourcemap: true,
        name: 'QuillReactPro',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      },
      {
        file: 'example/quill-react-pro.min.js',
        format: 'umd',
        sourcemap: false,
        name: 'QuillReactPro',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        }
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        emitDeclarationOnly: false,
      }),
      babel({
        babelHelpers: 'runtime',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      postcss({
        extensions: ['.css', '.less'],
        extract: 'quill-react-pro.css',
        minimize: true,
        use: [
          ['less', { javascriptEnabled: true }]
        ],
      }),
      svg(),
      terser(),
    ],
  },
];