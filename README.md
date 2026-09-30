# Notes and Reminders

A small browser app for keeping notes and reminders. It is plain HTML, CSS and JavaScript with no build step and no server. All data is saved in the browser's local storage.

## Features

- Create an account and log in (one account per browser)
- Add, edit, search and delete notes
- Add reminders with a date and time, mark them complete, and delete them
- Each reminder shows a status: upcoming, overdue or completed
- Summary counts for notes, reminders and completed reminders
- Privacy policy and terms and conditions pages

## What it does not do

- It does not send notifications, emails or messages. Reminders only show a status when the page is open.
- It does not sync between devices or browsers. Clearing the site's data in the browser removes everything.
- It cannot reset a forgotten password, because there is no server holding the account.

## Project files

| File | Purpose |
| --- | --- |
| `index.html` | Dashboard with notes, reminders and summary counts |
| `login.html` | Log in page |
| `register.html` | Create account page |
| `privacy.html` | Privacy policy |
| `terms.html` | Terms and conditions |
| `style.css` | Styles shared by every page |
| `script.js` | Accounts, notes, reminders and summary logic |
| `favicon.svg` | Site icon |

## Run it locally

The site needs a local server, because password hashing uses the browser's Web Crypto API, which is only reliable on `https` or `localhost`. Opening the files directly with a `file://` address can fail.

Pick one option:

**VS Code Live Server**
1. Install the Live Server extension.
2. Open the project folder in VS Code and trust it when asked.
3. Right-click `index.html` and choose Open with Live Server.

**Python**
```
cd notes
python -m http.server 8000
```
Then open `http://localhost:8000/login.html`.

Opening `index.html` while logged out sends you to the login page.

## How data is stored

Everything is kept in `localStorage` under these keys:

| Key | Contents |
| --- | --- |
| `userAccount` | Full name, username, password salt and password hash |
| `loggedInUser` | Name and username of the current session |
| `notes` | List of notes |
| `reminders` | List of reminders |

Passwords are never saved as typed. They are hashed with PBKDF2 (SHA-256, 150,000 iterations) and a random salt. An older account saved with a plain password is upgraded to a hash the next time it logs in.

This is a client-side app. Anyone with access to the browser profile can read the stored notes, and the login only controls access to the interface. Do not treat it as a secure place for sensitive information.

## Before you launch

- [ ] Connect a custom domain at your hosting provider and serve the site over https
- [ ] Replace `[add your contact email here before launch]` in `privacy.html` and `terms.html`
- [ ] Have the privacy policy and terms reviewed by someone qualified
- [ ] Confirm the favicon shows in the browser tab on every page
- [ ] Confirm no "Made with AI" or similar tag is added by your hosting platform

## Design rules for this project

- No purple gradients
- No emoji icons, and no em dashes in text
- No fake buttons, reviews, metrics or customer counters
- No cursor animation and no heavy scroll animation
- No generated photos and no filler copy
