import resolve from 'rollup-plugin-node-resolve'
import babel from 'rollup-plugin-babel'
import flow from 'rollup-plugin-flow'
import commonjs from 'rollup-plugin-commonjs'
import { uglify } from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-replace'
import pkg from './package.json'

const minify = process.env.MINIFY
const format = process.env.FORMAT
const es = format === 'es'
const umd = format === 'umd'
const cjs = format === 'cjs'

let output

if (es) {
  output = {
    file: `dist/react-final-form-html5-validation.es.js`,
    format: 'es'
  }
} else if (umd) {
  if (minify) {
    output = {
      file: `dist/react-final-form-html5-validation.umd.min.js`,
      format: 'umd'
    }
  } else {
    output = {
      file: `dist/react-final-form-html5-validation.umd.js`,
      format: 'umd'
    }
  }
} else if (cjs) {
  output = {
    file: `dist/react-final-form-html5-validation.cjs.js`,
    format: 'cjs'
  }
} else if (format) {
  throw new Error(`invalid format specified: "${format}".`)
} else {
  throw new Error('no format specified. --environment FORMAT:xxx')
}

const deps = Object.keys(pkg.dependencies || {})
const peers = Object.keys(pkg.peerDependencies || {})

export default {
  input: 'src/index.js',
  output: Object.assign(
    {
      name: 'react-final-form-html5-validation',
      exports: 'named',
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM',
        'prop-types': 'PropTypes',
        'final-form': 'FinalForm',
        'react-final-form': 'ReactFinalForm'
      }
    },
    output
  ),
  external: umd ? peers : deps.concat(peers),
  plugins: [
    resolve({ jsnext: true, main: true }),
    flow(),
    umd && commonjs({ include: 'node_modules/**' }),
    babel({
      exclude: 'node_modules/**',
      babelrc: false,
      presets: [['env', { modules: false }], 'stage-2'],
      plugins: ['external-helpers']
    }),
    umd
      ? replace({
          'process.env.NODE_ENV': JSON.stringify(
            minify ? 'production' : 'development'
          )
        })
      : null,
    minify ? uglify() : null
  ].filter(Boolean)
}
