import { globalIgnores } from 'eslint/config'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from 'eslint-config-prettier/flat'

export default defineConfigWithVueTs(
  {
    name: 'app/files-to-lint',
    files: ['**/*.{vue,ts,mts,tsx}'],
  },

  globalIgnores(['**/dist/**', '**/coverage/**', '**/node_modules/**']),

  ...pluginVue.configs['flat/essential'],
  vueTsConfigs.recommended,

  {
    name: 'app/never-render-data-as-html',
    rules: {
      // The data holds unsafe markup. Text from it goes through tokens only (D7).
      'vue/no-v-html': 'error',
    },
  },

  {
    name: 'app/domain-is-plain-typescript',
    files: ['src/domain/**/*.ts'],
    rules: {
      // The engine must run and be tested with no framework (D8).
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'vue', message: 'src/domain is plain TypeScript. Call it from a composable.' },
          ],
          patterns: [
            { group: ['@vue/*', '@vueuse/*', '*.vue'], message: 'src/domain is plain TypeScript.' },
          ],
        },
      ],
    },
  },

  skipFormatting,
)
