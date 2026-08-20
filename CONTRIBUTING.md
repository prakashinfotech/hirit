# Contributing to Hirit

Thank you for helping improve Hirit. This guide explains the expected development and pull-request workflow.

## Before You Start

- Read the project setup instructions in [README.md](README.md).
- Search existing issues and pull requests before starting duplicate work.
- For security vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Development Setup

Clone your fork and install the project dependencies:

```bash
git clone https://github.com/YOUR_USERNAME/hirit.git
cd hirit

cd frontend
npm install

cd ../backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # macOS/Linux
pip install -r requirements.txt
```

Configure local environment values using `.env` files. Never commit real credentials.

## Contribution Workflow

1. Create a branch from the latest `master` branch:

   ```bash
   git checkout master
   git pull origin master
   git checkout -b feature/short-description
   ```

2. Make focused changes that match the existing project structure and style.
3. Add or update tests when behavior changes.
4. Run the relevant quality checks.
5. Commit with a concise, imperative message.
6. Push your branch and open a pull request against `master`.

## Quality Checks

Run the frontend checks:

```bash
cd frontend
npm run typecheck
npm run build
```

Run the backend checks from the backend directory:

```bash
cd backend
pytest
```

## Security and Sensitive Data

Do not commit:

- API keys, tokens, passwords, or connection strings
- `.env` files or production configuration
- private certificates or SSH keys
- personal data, database exports, or service-account credentials

Use the tracked `.env.example` files only for safe placeholders. If a secret is committed accidentally, rotate it immediately before requesting history cleanup.

## Pull Request Checklist

- [ ] The change is focused and documented.
- [ ] Tests and builds relevant to the change pass locally.
- [ ] No secret, credential, or private data is included.
- [ ] New configuration variables are documented with safe placeholders.
- [ ] The pull request explains what changed and how it was verified.

By contributing, you agree that your contribution may be used under the repository's applicable license and company policies.
