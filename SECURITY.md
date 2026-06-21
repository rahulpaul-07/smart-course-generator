# Security Policy

## Supported Versions

Currently, only the `main` branch (v1.0.0+) is supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

Please do not report security vulnerabilities through public GitHub issues.

Instead, please email `security@unifiedcourseplatform.com` or send a direct message to the repository maintainers. 

We will acknowledge receipt of your vulnerability report within 48 hours and strive to send you regular updates about our progress. If a fix is required, we will push a patch as soon as possible and credit you for the discovery in our release notes.

**Note on LLM Injection:** We actively sanitize prompts, but as this platform heavily utilizes LLMs, please report any novel prompt-injection vectors that bypass our system context constraints.
