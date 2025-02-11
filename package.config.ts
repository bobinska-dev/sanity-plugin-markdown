import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  legacyExports: true,
  dist: 'lib',
  tsconfig: 'tsconfig.lib.json',

  rollup: {
    treeshake: {
      // Prevent treeshaking the `easymde/dist/easymde.min.css` import in index.ts
      moduleSideEffects: true,
    },
  },

  // Remove this block to enable strict export validation
  extract: {
    rules: {
      'ae-forgotten-export': 'off',
      'ae-incompatible-release-tags': 'off',
      'ae-internal-missing-underscore': 'off',
      'ae-missing-release-tag': 'off',
    },
  },
})
