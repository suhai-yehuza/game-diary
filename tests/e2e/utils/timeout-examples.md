# E2E Timeout Management Guide

## Why Centralized Timeouts?

### Problems with Hard-Coded Timeouts:

- ❌ **Inconsistent behavior** - Different timeouts for similar operations
- ❌ **Maintenance nightmare** - Hard to adjust timeouts globally
- ❌ **Flaky tests** - Timeouts that are too short cause failures, too long slow down tests
- ❌ **No context awareness** - Same timeout regardless of environment (CI vs local)
- ❌ **Poor debugging** - Hard to understand why specific timeouts were chosen

### Benefits of Centralized Timeouts:

- ✅ **Single source of truth** - All timeouts defined in one place
- ✅ **Environment-aware** - Automatically adjusts for CI vs local development
- ✅ **Consistent behavior** - Same timeout logic across all tests
- ✅ **Easy maintenance** - Change one value to update all related timeouts
- ✅ **Better debugging** - Clear timeout categories and purposes
- ✅ **Performance optimization** - Faster tests in fast environments, more reliable in slow ones

## Usage Examples

### Before (Hard-coded timeouts):

```typescript
// ❌ Bad: Hard-coded timeouts everywhere
await page.waitForSelector('.button', { timeout: 5000 });
await expect(element).toBeVisible({ timeout: 10000 });
await page.waitForTimeout(2000);
await element.click({ timeout: 3000 });
```

### After (Centralized timeouts):

```typescript
// ✅ Good: Using centralized timeout configuration
import { TIMEOUT_CONFIG } from './timeout-config';

await page.waitForSelector('.button', { timeout: TIMEOUT_CONFIG.ELEMENT_VISIBLE });
await expect(element).toBeVisible({ timeout: TIMEOUT_CONFIG.ELEMENT_VISIBLE });
await page.waitForTimeout(TIMEOUT_CONFIG.MEDIUM_WAIT);
await element.click({ timeout: TIMEOUT_CONFIG.CLICK });
```

## Available Timeout Categories

### Navigation Timeouts:

- `TIMEOUT_CONFIG.PAGE_LOAD` - Full page load (30s base)
- `TIMEOUT_CONFIG.DOM_CONTENT_LOADED` - DOM ready (10s base)
- `TIMEOUT_CONFIG.NETWORK_IDLE` - Network idle (15s base)

### Element Interaction Timeouts:

- `TIMEOUT_CONFIG.ELEMENT_VISIBLE` - Element visibility (5s base)
- `TIMEOUT_CONFIG.ELEMENT_CLICKABLE` - Element clickability (3s base)
- `TIMEOUT_CONFIG.ELEMENT_ATTRIBUTE` - Attribute access (2s base)
- `TIMEOUT_CONFIG.ELEMENT_COUNT` - Element counting (3s base)

### Action Timeouts:

- `TIMEOUT_CONFIG.CLICK` - Click actions (2s base)
- `TIMEOUT_CONFIG.TYPE` - Typing actions (1s base)
- `TIMEOUT_CONFIG.SCROLL` - Scrolling actions (1s base)

### Wait Timeouts:

- `TIMEOUT_CONFIG.SHORT_WAIT` - Short waits (500ms base)
- `TIMEOUT_CONFIG.MEDIUM_WAIT` - Medium waits (1s base)
- `TIMEOUT_CONFIG.LONG_WAIT` - Long waits (2s base)

### Animation/Transition Timeouts:

- `TIMEOUT_CONFIG.ANIMATION` - Animation completion (1s base)
- `TIMEOUT_CONFIG.TRANSITION` - CSS transitions (500ms base)

### API/Network Timeouts:

- `TIMEOUT_CONFIG.API_RESPONSE` - API responses (10s base)
- `TIMEOUT_CONFIG.GRAPHQL_QUERY` - GraphQL queries (15s base)

### Accessibility Check Timeouts:

- `TIMEOUT_CONFIG.ACCESSIBILITY_CHECK` - Accessibility checks (3s base)
- `TIMEOUT_CONFIG.IMAGE_LOAD` - Image loading (5s base)

### Test-Specific Timeouts:

- `TIMEOUT_CONFIG.AUTH_MODAL` - Authentication modals (5s base)
- `TIMEOUT_CONFIG.SEARCH_RESULTS` - Search result loading (10s base)
- `TIMEOUT_CONFIG.GAME_LOG_LOAD` - Game log loading (15s base)

## Environment Multipliers

The system automatically adjusts timeouts based on the environment:

- **Local Development**: 1.0x multiplier (base timeouts)
- **CI Environment**: 2.0x multiplier (slower, more reliable)
- **Debug Mode**: 3.0x multiplier (for troubleshooting)

### Example:

```typescript
// In local development: 5000ms
// In CI: 10000ms (5000 * 2.0)
// In debug mode: 15000ms (5000 * 3.0)
await expect(element).toBeVisible({ timeout: TIMEOUT_CONFIG.ELEMENT_VISIBLE });
```

## Custom Timeouts

For special cases, you can use custom multipliers:

```typescript
import { getTimeout } from './timeout-config';

// Use 1.5x multiplier for this specific case
const customTimeout = getTimeout('ELEMENT_VISIBLE', 1.5);
await expect(element).toBeVisible({ timeout: customTimeout });
```

## Migration Guide

### Step 1: Import the timeout config

```typescript
import { TIMEOUT_CONFIG } from './timeout-config';
```

### Step 2: Replace hard-coded timeouts

```typescript
// Before
await page.waitForSelector('.button', { timeout: 5000 });

// After
await page.waitForSelector('.button', { timeout: TIMEOUT_CONFIG.ELEMENT_VISIBLE });
```

### Step 3: Use appropriate timeout categories

```typescript
// For element visibility
await expect(element).toBeVisible({ timeout: TIMEOUT_CONFIG.ELEMENT_VISIBLE });

// For clicking
await element.click({ timeout: TIMEOUT_CONFIG.CLICK });

// For waiting
await page.waitForTimeout(TIMEOUT_CONFIG.MEDIUM_WAIT);
```

## Best Practices

1. **Use semantic timeout names** - Choose the most appropriate timeout category
2. **Avoid custom multipliers** - Use the default environment-aware timeouts
3. **Group related timeouts** - Use the same timeout category for related operations
4. **Document exceptions** - If you need a custom timeout, document why
5. **Test in different environments** - Verify timeouts work in both local and CI

## Debugging

Enable debug mode to see timeout configuration:

```bash
DEBUG=true pnpm playwright test
```

This will log the current timeout configuration and multipliers.
