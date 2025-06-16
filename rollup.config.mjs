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

// Define external dependencies to reduce bundle size
const external = [
  'react',
  'react-dom',
  'quill',
  'quill-delta',
  'quill-better-table',
  'highlight.js',
  /^highlight\.js\//,  // All highlight.js sub-imports
  'core-js',
  /^core-js\//,
  '@babel/runtime',
  /^@babel\/runtime\//
];

export default [
  {
    input: './index.tsx',
    external,
    output: {
      file: pkg.main,
      format: 'esm',
      // Remove source maps for production lib build
      sourcemap: false,
    },
    plugins: [
      peerDepsExternal(),
      resolve({
        preferBuiltins: false,
        browser: true,
      }),
      commonjs({ 
        transformMixedEsModules: true,
        // Exclude large dependencies from bundling
        exclude: ['node_modules/highlight.js/**', 'node_modules/quill/**']
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: true,
        declarationDir: 'lib',
        rootDir: '.',
      }),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }),
      postcss({
        extensions: ['.css', '.less'],
        extract: 'style.css',
        minimize: true, // Minimize CSS even in lib build
        use: [
          ['less', { javascriptEnabled: true }]
        ],
      }),
      svg(),
    ],
  },
  {
    input: './index.tsx',
    external: ['react', 'react-dom'], // Only peer dependencies as external for UMD
    output: [
      {
        file: 'dist/quill-react-pro.min.js',
        format: 'umd',
        sourcemap: false, // Disable source maps to save 4.2MB
        name: 'QuillReactPro',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        },
        inlineDynamicImports: true, // Fix UMD code-splitting issue
      },
      {
        file: 'example/quill-react-pro.min.js',
        format: 'umd',
        sourcemap: false,
        name: 'QuillReactPro',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM'
        },
        inlineDynamicImports: true, // Fix UMD code-splitting issue
      },
    ],
    plugins: [
      peerDepsExternal(),
      resolve({
        preferBuiltins: false,
        browser: true,
        // Include all dependencies in UMD build except React
        skip: ['react', 'react-dom']
      }),
      commonjs({
        transformMixedEsModules: true,
      }),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false,
        declarationDir: undefined,
        emitDeclarationOnly: false,
      }),
      babel({
        babelHelpers: 'bundled',
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
      terser({
        compress: {
          drop_console: false, // Keep console logs for UMD debug
          drop_debugger: true,
        },
        mangle: {
          safari10: true,
        },
      }),
    ],
  },
];