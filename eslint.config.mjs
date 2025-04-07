import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
	// Vue-specific rules
	{
		files: ['.vue'],
		rules: {
			'vue/multi-word-component-names': 'error'
		}
	},
	{
		files: ['app.vue', 'error.vue', 'pages/**/*.vue', 'layouts/**/*.vue'],
		rules: {
			'vue/multi-word-component-names': 'off'
		}
	},
	// Stylistic rules
	{
		rules: {
			'@stylistic/indent': ['error', 'tab'],
			'@stylistic/no-tabs': ['off', { allowIndentationTabs: true }],
			'@stylistic/semi': ['error', 'never'],
			'@stylistic/quotes': ['error', 'single'],
			'@stylistic/brace-style': ['error', 'allman'],
			'@stylistic/comma-dangle': ['error', 'never'],
			'@stylistic/block-spacing': ['error', 'always'],
			'@stylistic/arrow-parens': ['error', 'always']
		}
	},
	// Ignore patterns
	{
		ignores: ['.nuxt//', 'node_modules/**/', '.output/*/']
	}
)
	// TypeScript rules
	.override('nuxt/typescript/rules', {
		files: ['/.ts', '**/.tsx', '/*.vue'],
		languageOptions: {
			parserOptions: {
				project: './tsconfig.json',
				tsconfigRootDir: import.meta.dirname
			}
		},
		rules: {
			'@typescript-eslint/no-unnecessary-condition': 'error',
			'@typescript-eslint/only-throw-error': 'off',
			'@typescript-eslint/no-non-null-assertion': 'error',
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unused-vars': [
				'warn',
				{
					varsIgnorePattern: '^',
					argsIgnorePattern: '^',
					caughtErrorsIgnorePattern: '^_'
				}
			],
			'@typescript-eslint/no-unused-expressions': [
				'error',
				{ allowShortCircuit: true }
			],
			'@typescript-eslint/strict-boolean-expressions': [
				'error',
				{
					allowNullableString: false,
					allowNullableNumber: false,
					allowNullableObject: false
				}
			]
		}
	})
