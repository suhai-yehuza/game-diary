# Coverage Enforcement System

This document describes the comprehensive coverage enforcement system implemented for both unit and E2E tests in the Placeholder project.

## Overview

The coverage enforcement system implements two complementary strategies to ensure high-quality test coverage:

1. **Coverage Analysis**: Analyzes test results and calculates coverage percentages
2. **Test Count Enforcement**: Ensures minimum number of tests are executed

## Components

### 1. Coverage Enforcement Script (`scripts/coverage-enforcement.ts`)

A TypeScript script that analyzes both unit and E2E test coverage and enforces configurable thresholds.

#### Features:

- **Unit Test Analysis**: Parses Vitest coverage reports and test results
- **E2E Test Analysis**: Parses Playwright test results and E2E coverage reports
- **Configurable Thresholds**: Set different thresholds for unit and E2E tests
- **Detailed Reporting**: Generates comprehensive coverage reports with recommendations
- **Multiple Modes**: Support for coverage-only, test-count-only, or both

#### Usage:

```bash
# Basic usage with default thresholds
pnpm coverage:enforce

# Custom thresholds
pnpm coverage:enforce --unit-threshold=90 --e2e-threshold=80

# Test count enforcement only
pnpm coverage:enforce --test-count-only --min-unit-tests=100 --min-e2e-tests=50

# Both coverage and test count
pnpm coverage:enforce --both --unit-threshold=85 --e2e-threshold=75 --min-unit-tests=75 --min-e2e-tests=40
```

### 2. Pre-push Coverage Hook (`scripts/pre-push-coverage.sh`)

A bash script that enforces coverage thresholds before allowing git push operations.

#### Features:

- **Git Integration**: Automatically runs before push operations
- **Smart Skipping**: Skips coverage checks for merge commits, rebases, and special cases
- **Configurable Thresholds**: Environment variables and command-line options
- **Detailed Reporting**: Shows coverage status and recommendations
- **Bypass Options**: Multiple ways to skip coverage checks when needed

#### Usage:

```bash
# Manual execution
./scripts/pre-push-coverage.sh

# Custom thresholds
./scripts/pre-push-coverage.sh --unit-threshold=90 --e2e-threshold=80

# Skip coverage check
./scripts/pre-push-coverage.sh --skip

# Environment variable configuration
UNIT_COVERAGE_THRESHOLD=90 E2E_COVERAGE_THRESHOLD=80 ./scripts/pre-push-coverage.sh
```

### 3. CI/CD Integration

The coverage enforcement system is integrated into the GitHub Actions workflows:

#### Nightly Workflow Integration:

- **Coverage Enforcement Job**: Runs after unit and E2E tests complete
- **Artifact Management**: Downloads test results and generates coverage reports
- **Failure Handling**: Fails the workflow if coverage thresholds are not met
- **Detailed Reporting**: Includes coverage status in test summaries

#### Configuration:

```yaml
coverage-enforcement:
  name: Coverage Enforcement
  needs: [unit-tests, e2e-compound]
  steps:
    - name: Run Coverage Enforcement
      run: |
        pnpm coverage:enforce \
          --unit-threshold=80 \
          --e2e-threshold=70 \
          --min-unit-tests=50 \
          --min-e2e-tests=30
```

## Configuration

### Default Thresholds

| Test Type  | Coverage Threshold | Min Test Count |
| ---------- | ------------------ | -------------- |
| Unit Tests | 80%                | 50             |
| E2E Tests  | 70%                | 30             |

### Environment Variables

| Variable                  | Description                      | Default |
| ------------------------- | -------------------------------- | ------- |
| `UNIT_COVERAGE_THRESHOLD` | Unit test coverage threshold (%) | 80      |
| `E2E_COVERAGE_THRESHOLD`  | E2E test coverage threshold (%)  | 70      |
| `MIN_UNIT_TESTS`          | Minimum number of unit tests     | 50      |
| `MIN_E2E_TESTS`           | Minimum number of E2E tests      | 30      |
| `SKIP_COVERAGE_CHECK`     | Skip coverage enforcement        | false   |

### Command Line Options

#### Coverage Enforcement Script:

- `--unit-threshold=N`: Set unit coverage threshold
- `--e2e-threshold=N`: Set E2E coverage threshold
- `--min-unit-tests=N`: Set minimum unit tests
- `--min-e2e-tests=N`: Set minimum E2E tests
- `--coverage-only`: Only check coverage percentages
- `--test-count-only`: Only check test counts
- `--both`: Check both coverage and test counts
- `--output=PATH`: Set output file path

#### Pre-push Script:

- `--unit-threshold=N`: Set unit coverage threshold
- `--e2e-threshold=N`: Set E2E coverage threshold
- `--min-unit-tests=N`: Set minimum unit tests
- `--min-e2e-tests=N`: Set minimum E2E tests
- `--skip`: Skip coverage check
- `--help`: Show help message

## Package.json Scripts

```json
{
  "test:unit:json": "vitest run --reporter=json --coverage",
  "coverage:enforce": "tsx scripts/coverage-enforcement.ts",
  "coverage:enforce:coverage": "tsx scripts/coverage-enforcement.ts --coverage-only",
  "coverage:enforce:test-count": "tsx scripts/coverage-enforcement.ts --test-count-only",
  "coverage:enforce:both": "tsx scripts/coverage-enforcement.ts --both",
  "pre-push:coverage": "./scripts/pre-push-coverage.sh",
  "pre-push:coverage:strict": "./scripts/pre-push-coverage.sh --unit-threshold=90 --e2e-threshold=80 --min-unit-tests=100 --min-e2e-tests=50"
}
```

## Coverage Reports

### Report Structure

The coverage enforcement system generates detailed JSON reports:

```json
{
  "success": true,
  "unit": {
    "type": "unit",
    "coverage": 85.5,
    "testCount": 75,
    "passed": 73,
    "failed": 2,
    "skipped": 0,
    "metThreshold": true,
    "metTestCount": true,
    "details": {
      "branches": 82.1,
      "functions": 88.3,
      "lines": 85.5,
      "statements": 86.2
    }
  },
  "e2e": {
    "type": "e2e",
    "coverage": 72.5,
    "testCount": 45,
    "passed": 43,
    "failed": 2,
    "skipped": 0,
    "metThreshold": true,
    "metTestCount": true
  },
  "summary": {
    "overallPassed": true,
    "unitPassed": true,
    "e2ePassed": true,
    "recommendations": ["✅ All coverage thresholds and test count requirements are met!"]
  }
}
```

### Report Locations

- **Coverage Enforcement**: `./coverage/enforcement-report.json`
- **Pre-push Reports**: `./coverage/pre-push-enforcement.json`
- **CI/CD Reports**: Available as workflow artifacts

## Bypassing Coverage Checks

### Pre-push Script Bypass Options

1. **Environment Variable**:

   ```bash
   SKIP_COVERAGE_CHECK=true git push
   ```

2. **Commit Message**:

   ```bash
   git commit -m "Your message [skip coverage]"
   ```

3. **Command Line Option**:

   ```bash
   ./scripts/pre-push-coverage.sh --skip
   ```

4. **Special Git Operations**:
   - Merge commits (automatic skip)
   - Rebase operations (automatic skip)

### CI/CD Bypass

For CI/CD workflows, coverage enforcement can be controlled through:

- Workflow inputs
- Environment variables
- Conditional job execution

## Best Practices

### 1. Setting Appropriate Thresholds

- **Unit Tests**: Start with 80% and gradually increase to 90%+
- **E2E Tests**: Start with 70% and target 80%+ for critical paths
- **Test Counts**: Ensure sufficient test cases for each component

### 2. Coverage Quality

- Focus on meaningful coverage, not just percentage
- Test edge cases and error conditions
- Ensure critical business logic is well-tested
- Balance unit and E2E test coverage

### 3. Continuous Improvement

- Monitor coverage trends over time
- Set realistic but challenging thresholds
- Review and adjust thresholds based on project maturity
- Use coverage reports to identify testing gaps

### 4. Team Workflow

- Integrate coverage checks into development workflow
- Use pre-push hooks for immediate feedback
- Provide clear bypass options for special cases
- Document coverage requirements and expectations

## Troubleshooting

### Common Issues

1. **Coverage Reports Not Found**:

   - Ensure tests are run with coverage enabled
   - Check file paths in configuration
   - Verify test output formats

2. **Thresholds Too Strict**:

   - Start with lower thresholds and gradually increase
   - Focus on critical paths first
   - Consider different thresholds for different components

3. **Pre-push Hook Failures**:

   - Check if tests are passing
   - Verify coverage thresholds are reasonable
   - Use bypass options for urgent fixes

4. **CI/CD Integration Issues**:
   - Ensure artifacts are properly uploaded/downloaded
   - Check job dependencies and timing
   - Verify environment variables are set correctly

### Debugging

1. **Verbose Output**:

   ```bash
   pnpm coverage:enforce --debug
   ```

2. **Manual Testing**:

   ```bash
   # Test unit coverage
   pnpm test:unit:json

   # Test E2E coverage
   pnpm test:e2e:sanity

   # Run enforcement manually
   pnpm coverage:enforce
   ```

3. **Report Analysis**:

   ```bash
   # View coverage report
   cat ./coverage/enforcement-report.json | jq '.'

   # Check specific metrics
   cat ./coverage/enforcement-report.json | jq '.unit.coverage'
   ```

## Future Enhancements

### Planned Features

1. **Trend Analysis**: Track coverage changes over time
2. **Coverage Visualization**: Web-based coverage dashboards
3. **Smart Thresholds**: Dynamic thresholds based on code complexity
4. **Integration with IDEs**: Real-time coverage feedback
5. **Coverage Budgets**: Per-component coverage requirements

### Contributing

To contribute to the coverage enforcement system:

1. Follow the existing code patterns
2. Add comprehensive tests for new features
3. Update documentation for any changes
4. Consider backward compatibility
5. Test with different project configurations

## Conclusion

The coverage enforcement system provides a robust foundation for maintaining high-quality test coverage across both unit and E2E tests. By combining coverage analysis with test count enforcement, it ensures comprehensive testing while remaining flexible enough to accommodate different project needs and development workflows.

The system integrates seamlessly with existing CI/CD pipelines and development workflows, providing immediate feedback and preventing code quality degradation over time.
