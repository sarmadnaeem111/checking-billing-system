# Security Guidelines for Golden Oil Web Application

## Overview
This document outlines the security measures implemented in the Golden Oil web application and provides guidelines for maintaining and enhancing security.

## Authentication & Authorization

### Firebase Authentication
- The application uses Firebase Authentication for secure user management.
- Admin authentication is handled through Firebase Authentication with additional verification.
- Passwords are never stored in the application code or database.

### Authorization Rules
- Firestore security rules enforce access control at the database level.
- Storage security rules protect uploaded files and images.
- Admin access is restricted to verified admin accounts only.

## Environment Variables

### Configuration Management
- All sensitive configuration values are stored in environment variables.
- The `.env` file contains sensitive information and should NEVER be committed to version control.
- Use `.env.example` as a template for required environment variables.

### Required Environment Variables
```
REACT_APP_FIREBASE_API_KEY=
REACT_APP_FIREBASE_AUTH_DOMAIN=
REACT_APP_FIREBASE_PROJECT_ID=
REACT_APP_FIREBASE_STORAGE_BUCKET=
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=
REACT_APP_FIREBASE_APP_ID=
REACT_APP_FIREBASE_MEASUREMENT_ID=
REACT_APP_ADMIN_EMAIL=
```

## Secure Development Practices

### Password Policies
- Enforce strong password requirements (minimum 8 characters, mix of uppercase, lowercase, numbers, and special characters).
- Implement account lockout after multiple failed login attempts.

### Data Validation
- Validate all user inputs on both client and server sides.
- Sanitize data before storing in the database or displaying to users.

### HTTPS
- Always use HTTPS for production deployments.
- Configure secure headers (Content-Security-Policy, X-XSS-Protection, etc.).

## Deployment Security

### Firebase Security Rules
- Deploy Firestore security rules using Firebase CLI:
  ```
  firebase deploy --only firestore:rules
  ```

- Deploy Storage security rules using Firebase CLI:
  ```
  firebase deploy --only storage:rules
  ```

### Environment Setup
- For Netlify deployment, configure environment variables in the Netlify dashboard.
- For Vercel deployment, configure environment variables in the Vercel dashboard.

## Security Monitoring

### Firebase App Check
- Consider implementing Firebase App Check to prevent abuse of your backend resources.

### Logging and Monitoring
- Enable Firebase Analytics and Monitoring to track suspicious activities.
- Regularly review authentication logs for unusual patterns.

## Security Updates

- Keep all dependencies updated to their latest secure versions.
- Regularly audit the codebase for security vulnerabilities.
- Subscribe to security notifications for all used libraries and frameworks.

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by contacting the project maintainers directly rather than creating a public issue.