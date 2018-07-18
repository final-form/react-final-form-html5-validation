const { NODE_ENV } = process.env
const test = NODE_ENV === 'test'
const loose = true

module.exports = {
  presets: [
    ['env', test ? { loose, targets: { node: 8 } } : { loose, modules: false }],
    'react',
    'stage-2'
  ],
  plugins: [
    'transform-flow-strip-types',
    test && 'transform-react-jsx-source',
    test && 'istanbul'
  ].filter(Boolean)
}
