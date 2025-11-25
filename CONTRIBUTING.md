# Contributing to Finance Mentor AI

First off, thank you for considering contributing to Finance Mentor AI! 🎉

## Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code.

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check the existing issues to avoid duplicates. When you create a bug report, include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List any alternative solutions you've considered**

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes
4. Make sure your code lints
5. Issue that pull request!

## Development Setup

```bash
# Clone your fork
git clone https://github.com/your-username/finance-mentor-ai.git

# Install dependencies
npm install

# Start development server
npm run dev

# Run build
npm run build
```

## Coding Guidelines

### TypeScript

- Use TypeScript for all new files
- Define proper types and interfaces
- Avoid `any` type when possible
- Use meaningful variable names

### React

- Use functional components with hooks
- Keep components small and focused
- Use proper prop types
- Implement proper error boundaries

### Styling

- Use Tailwind CSS utility classes
- Follow the existing design system
- Ensure responsive design
- Test on multiple screen sizes

### Animations

- Use Framer Motion for animations
- Keep animations smooth (60fps)
- Ensure accessibility (respect prefers-reduced-motion)
- Don't overuse animations

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters
- Reference issues and pull requests

Examples:
```
feat: Add budget export functionality
fix: Resolve transaction sorting issue
docs: Update installation instructions
style: Format code with prettier
refactor: Simplify AI response generation
test: Add tests for savings goals
chore: Update dependencies
```

## Project Structure

```
components/     - React components
services/       - Business logic and AI
contexts/       - React contexts
hooks/          - Custom React hooks
lib/            - Utility functions
types.ts        - TypeScript types
```

## Testing

```bash
# Run tests (when available)
npm test

# Run linter
npm run lint

# Type check
npm run type-check
```

## Documentation

- Update README.md if needed
- Add JSDoc comments for complex functions
- Update CHANGELOG.md for notable changes

## Questions?

Feel free to open an issue with your question or reach out to the maintainers.

Thank you for contributing! 🙏
