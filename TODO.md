# TODO

## Configuration
- [x] Remove hardcoded path from package.json default settings
  - Changed extractorPath default to `markdown-org-extract` (searches in PATH)
  - Changed maintainFilePath default to empty string (disabled)
  - Added dateLocale setting with `en-US` default
- [x] Add helpful error messages for missing configuration
  - extractorPath: shows error if not found
  - maintainFilePath: shows error if not configured when using Promote to Maintain
- [ ] Add validation for extractorPath configuration
  - Check if file exists using fs.existsSync()
  - Show clear error message if extractor not found
  - Suggest configuration steps

## Publishing
- [x] Add publisher field to package.json
  - Added `"publisher": "vitalyostanin"`
  - Note: Publisher must be registered at https://marketplace.visualstudio.com/manage before publishing

## Documentation
- [x] Improve README.md
  - Added Features section with Org mode link
  - Added Quick Start section
  - Added comprehensive syntax examples (tasks, priorities, timestamps, repeaters)
  - Documented all commands with hotkeys in tables
  - Added detailed Settings section with examples
  - Documented markdown-org-extract dependency and installation
- [ ] Add screenshots/GIF demonstrations
- [ ] Create CHANGELOG.md
  - Document version 0.1.0 features
  - Set up format for future releases

## Testing
- [ ] Add unit tests for core functionality
  - Test timestamp parsing and manipulation
  - Test task status changes
  - Test priority toggling
- [ ] Add integration tests for commands
- [ ] Set up test framework (e.g., Mocha, Jest)
