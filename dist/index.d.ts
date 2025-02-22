import { Plugin as Plugin$1 } from 'vite'

type PluginOptions = {
  enabledMode?: ('development' | 'production')[]
  global?: {
    generate: boolean
    outFile: string
  }
  typeName?: {
    replacement: string | ((fileName: string) => string)
  }
  oneFile?: boolean
  outputDir?: string
  sourceDir?: string
}

declare function Plugin(option?: PluginOptions): Plugin$1

export { Plugin as default }
