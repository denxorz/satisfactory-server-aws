# Password Protection Setup

This status page now includes simple password protection to restrict access to the dashboard.

## Default Password

The default password is: `Wheeeeee!`

## How to Change the Password

To change the password, edit the `VITE_APP_PASSWORD` variable in `.env.local`:

```bash
# Change this line in .env.local
VITE_APP_PASSWORD=your-new-password-here
```

If the environment variable is not set, it will fall back to the default password: `Wheeeeee!`

## Features

- **Remember Me**: The password is stored in localStorage, so users don't need to re-enter it every time
- **Logout**: Users can log out using the logout button in the toolbar
- **Simple**: No server-side authentication required - works entirely client-side
- **Secure**: While not enterprise-grade, it provides basic protection for casual access control

## How It Works

1. When the page loads, it checks if a valid password is stored in localStorage
2. If no valid password is found, the login screen is shown
3. After successful authentication, the password is stored and the main dashboard is displayed
4. The logout button clears the stored password and reloads the page

## Security Notes

- This is client-side only protection suitable for basic access control
- The password is stored in plain text in localStorage
- For more security, consider implementing server-side authentication
- The password is now stored in environment variables (`.env.local`) instead of hardcoded in the source code
- The `.env.local` file should be added to `.gitignore` to prevent committing passwords to version control
- If the environment variable is not set, it falls back to a default password

## Customization

You can customize the login screen appearance by modifying the styles in `LoginScreen.vue`. The design matches the Satisfactory theme with orange accents and dark styling.
