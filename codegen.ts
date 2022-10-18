import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
    overwrite: true,
    schema: 'https://api.lens.dev/',
    documents: ['src/**/*.tsx', 'src/**/*.ts'],
    generates: {
        'src/lens/schema': {
            preset: 'client',
            plugins: []
        }
    }
}

export default config