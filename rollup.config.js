// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';

// 在Windows上，执行set NODE_ENV=production 或者 set NODE_ENV=development 来切换生产环境和开发环境
export default {
  entry: 'vue-dragging.js',
  dest: 'vue-dragging.es5.js',
  format: 'es',
  plugins: [
    babel({exclude: 'node_modules/**'}),
    eslint({exclude: 'node_modules/**'}),
    replace({
      exclude: 'node_modules/**',
      ENV: JSON.stringify(process.env.NODE_ENV || 'development')
    }),
    (process.env.NODE_ENV === 'production' && uglify())
  ]
}