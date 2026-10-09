import type { SqlJsStatic } from 'sql.js'
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'

/** Lazy-load sql.js (~1 MB wasm) only when the user imports a deck. */
export async function loadSql(): Promise<SqlJsStatic> {
  const { default: initSqlJs } = await import('sql.js')
  return initSqlJs({ locateFile: () => wasmUrl })
}
