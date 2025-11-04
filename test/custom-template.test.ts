import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { NodeArweaveWallet } from '../src/index'

describe('Custom HTML Template Configuration', () => {
  const testDir = join(tmpdir(), 'node-arweave-wallet-test')
  let customHtmlPath: string
  let customJsPath: string

  beforeEach(() => {
    if (!existsSync(testDir)) {
      mkdirSync(testDir, { recursive: true })
    }
    customHtmlPath = join(testDir, 'custom.html')
    customJsPath = join(testDir, 'custom.js')
  })

  afterEach(() => {
    [customHtmlPath, customJsPath].forEach((file) => {
      if (existsSync(file))
        unlinkSync(file)
    })
  })

  it('should load custom template when valid path provided', () => {
    writeFileSync(customHtmlPath, '<html><body>Custom UI</body></html>')

    const wallet = new NodeArweaveWallet({
      port: 0,
      customHtmlTemplatePath: customHtmlPath,
    })

    const html = (wallet as any).getSignerHTML() // Access private method for testing
    expect(html).toContain('Custom UI')
  })

  it('should fallback to default when custom path not provided', () => {
    const wallet = new NodeArweaveWallet({ port: 0 })
    const html = (wallet as any).getSignerHTML()
    expect(html).toContain('window.arweaveWallet') // Default template has wallet detection
  })

  it('should fallback to default when custom file not found', () => {
    const wallet = new NodeArweaveWallet({
      port: 0,
      customHtmlTemplatePath: '/nonexistent/path.html',
    })

    const html = (wallet as any).getSignerHTML()
    expect(html).toContain('window.arweaveWallet')
  })

  it('should fallback to default when custom file empty', () => {
    writeFileSync(customHtmlPath, '   ') // Whitespace only

    const wallet = new NodeArweaveWallet({
      port: 0,
      customHtmlTemplatePath: customHtmlPath,
    })

    const html = (wallet as any).getSignerHTML()
    expect(html).toContain('window.arweaveWallet')
  })

  it('SECURITY: should reject path traversal attempts', () => {
    const wallet = new NodeArweaveWallet({
      port: 0,
      customHtmlTemplatePath: '../../../etc/passwd',
    })

    const html = (wallet as any).getSignerHTML()
    expect(html).toContain('window.arweaveWallet') // Falls back to default
  })

  it('should inline JavaScript from external file', () => {
    writeFileSync(customHtmlPath, '<html><script src="custom.js"></script></html>')
    writeFileSync(customJsPath, 'console.log("custom");')

    const wallet = new NodeArweaveWallet({
      port: 0,
      customHtmlTemplatePath: customHtmlPath,
    })

    const html = (wallet as any).getSignerHTML()
    expect(html).toContain('<script>console.log("custom");</script>')
    expect(html).not.toContain('src="custom.js"')
  })

  it('should handle TypeScript compilation with new config property', () => {
    // This test validates that the TypeScript interface compiles correctly
    const config = {
      port: 0,
      customHtmlTemplatePath: '/path/to/custom.html',
    }

    expect(() => new NodeArweaveWallet(config)).not.toThrow()
  })
})
