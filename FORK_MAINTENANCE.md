# Fork Maintenance Guide

## Purpose

This fork adds **custom UI template support** to `node-arweave-wallet` for Permamind branding.

**Key Feature**: `customHtmlTemplatePath` configuration option allows loading custom HTML templates instead of the default wallet connection UI.

## Fork Details

- **Upstream Repository**: https://github.com/pawanpaudel93/node-arweave-wallet
- **Fork Repository**: https://github.com/ALLiDoizCode/node-arweave-wallet
- **Custom Branch**: `permamind-custom-ui`
- **npm Package**: `@permamind/node-arweave-wallet`
- **Current Version**: 0.0.13 (upstream: 0.0.12)

## Custom Features

### customHtmlTemplatePath Configuration

Added `customHtmlTemplatePath` property to `NodeArweaveWalletConfig` interface:

```typescript
interface NodeArweaveWalletConfig {
  port?: number
  freePort?: boolean
  requestTimeout?: number
  browser?: string | false
  browserProfile?: string
  customHtmlTemplatePath?: string // NEW: Path to custom HTML template
}
```

**Usage**:
```typescript
import { NodeArweaveWallet } from '@permamind/node-arweave-wallet'

const wallet = new NodeArweaveWallet({
  port: 0,
  customHtmlTemplatePath: './my-custom-wallet-ui.html'
})

await wallet.initialize()
```

**Security Features**:
- Path traversal prevention (`..` rejected)
- File existence validation
- Empty file detection
- Fallback to default template on any error
- JavaScript inlining support (preserves SSE protocol)

## Upstream Sync Strategy

### Periodic Rebase Workflow

1. **Fetch upstream changes**:
   ```bash
   cd /Users/jonathangreen/Documents/node-arweave-wallet
   git fetch upstream
   ```

2. **Review upstream changes**:
   ```bash
   git log upstream/main --oneline --graph
   ```

3. **Rebase custom branch**:
   ```bash
   git checkout permamind-custom-ui
   git rebase upstream/main
   ```

4. **Resolve conflicts** (if any):
   - Prioritize upstream changes unless they break custom UI feature
   - Test custom template loading after resolving
   - Run full test suite: `pnpm test`

5. **Test fork**:
   ```bash
   pnpm install
   pnpm run build
   pnpm test
   ```

6. **Publish new version** (if tests pass):
   ```bash
   # Bump version in package.json (e.g., 0.0.13 → 0.0.14)
   npm version patch
   pnpm publish
   ```

7. **Push changes**:
   ```bash
   git push origin permamind-custom-ui --force-with-lease
   ```

### Conflict Resolution Guidelines

**Common Conflict Scenarios**:

1. **Changes to `getSignerHTML()` method**:
   - Preserve custom template logic
   - Merge upstream improvements to default template
   - Test both custom and default paths

2. **Changes to `NodeArweaveWalletConfig` interface**:
   - Keep `customHtmlTemplatePath` property
   - Add new upstream properties if any

3. **Changes to constructor**:
   - Ensure `customHtmlTemplatePath` is still stored in config

4. **Changes to package.json**:
   - Keep fork-specific fields (name, description, repository)
   - Merge upstream dependency updates
   - Maintain `@permamind` scope and version strategy

## Version Strategy

- **Fork version** = upstream version + 1 (e.g., upstream 0.0.12 → fork 0.0.13)
- **Minor/patch updates**: Follow upstream versioning, increment by 1
- **Major breaking changes**: Align with upstream major version

**Version History**:
- `0.0.13` - Initial fork with custom UI template support (upstream 0.0.12)

## Upstream Contribution Plan

### Goal

Submit PR to `pawanpaudel93/node-arweave-wallet` adding `customHtmlTemplatePath` config option to eliminate long-term fork maintenance.

### When to Submit PR

- **After Story 12.3 complete**: Custom template validated in production
- **Demonstrate value**: Show real-world use case (Permamind branding)
- **Clean implementation**: Code reviewed, tested, documented

### PR Checklist

- [ ] Clean commit history (squash fork-specific commits)
- [ ] Upstream tests pass
- [ ] Documentation updated (README, API docs)
- [ ] Example usage provided
- [ ] Security considerations documented
- [ ] Backward compatible (optional property)

### If PR Accepted

- Deprecate fork package
- Migrate Permamind to upstream version
- Archive fork repository

### If PR Rejected

- Maintain fork long-term
- Continue periodic upstream syncs
- Document fork necessity in Permamind docs

## Building and Publishing

### Prerequisites

1. **pnpm with catalog: protocol support**:
   ```bash
   corepack enable
   corepack prepare pnpm@10.17.1 --activate
   ```

2. **npm login** with @permamind org access:
   ```bash
   npm login
   # Enter credentials for account with @permamind scope access
   ```

### Build Process

```bash
cd /Users/jonathangreen/Documents/node-arweave-wallet
pnpm install
pnpm run build
pnpm test
```

**Verify build artifacts**:
```bash
ls -la dist/
# Should contain: index.js, index.d.ts, signer/ directory
```

### Publishing to npm

```bash
# Ensure package.json version is bumped
# Ensure publishConfig.access = "public" is set

pnpm publish
```

**Verify publication**:
```bash
npm view @permamind/node-arweave-wallet
npm install @permamind/node-arweave-wallet
```

## Testing Fork Changes

### Unit Tests

```bash
pnpm test
```

**Custom template tests**: `test/custom-template.test.ts`
- Valid custom template loading
- Fallback scenarios
- Security validations (path traversal)
- JavaScript inlining

### Integration Testing

Test with Permamind CLI:
```bash
cd /Users/jonathangreen/Documents/Permamind
npm install
npm run build
npm test
```

### Manual Testing

1. **Default template** (no customHtmlTemplatePath):
   ```typescript
   const wallet = new NodeArweaveWallet({ port: 0 })
   await wallet.initialize()
   // Opens default wallet UI
   ```

2. **Custom template**:
   ```typescript
   const wallet = new NodeArweaveWallet({
     port: 0,
     customHtmlTemplatePath: './custom-ui.html'
   })
   await wallet.initialize()
   // Opens custom branded UI
   ```

3. **Fallback scenarios**:
   - Invalid path → default template
   - Empty file → default template
   - Path traversal attempt → default template (security)

## Monitoring Upstream Updates

### Automated Notifications

Set up GitHub notifications for upstream repository:
1. Visit: https://github.com/pawanpaudel93/node-arweave-wallet
2. Click "Watch" → "Custom" → "Releases"
3. Receive email on new releases

### Manual Checks (Quarterly)

```bash
# Check for new upstream releases
git fetch upstream
git log permamind-custom-ui..upstream/main --oneline

# Review changelog
curl -s https://api.github.com/repos/pawanpaudel93/node-arweave-wallet/releases/latest | jq
```

## Rollback Plan

If fork causes issues:

1. **Revert CLI to upstream**:
   ```bash
   cd /Users/jonathangreen/Documents/Permamind
   npm install node-arweave-wallet@^0.0.12
   git checkout HEAD -- cli/src/lib/node-arweave-wallet-adapter.ts
   ```

2. **Test upstream version**:
   ```bash
   npm test
   ```

3. **Document issue**:
   - Create GitHub issue in fork repository
   - Note specific failure scenario

## Contact & Support

- **Fork Maintainer**: Permamind Team (ALLiDoizCode GitHub org)
- **Upstream Maintainer**: Pawan Paudel (pawanpaudel93)
- **Issues**: https://github.com/ALLiDoizCode/node-arweave-wallet/issues
- **Upstream Issues**: https://github.com/pawanpaudel93/node-arweave-wallet/issues

---

**Last Updated**: 2025-11-04
**Maintainer**: Permamind Development Team
**Upstream Version**: 0.0.12
**Fork Version**: 0.0.13
