# PhaseRoll

PhaseRoll is the marketing and waitlist site for a photo app that organizes
memories around life chapters instead of camera-roll dates.

The site includes a responsive editorial landing page, product mockup slots,
scroll-linked motion, generated Open Graph imagery, Vercel Analytics, and a
server-side waitlist proxy for Google Sheets.

## Stack

- Next.js 16 App Router
- React 19 and TypeScript
- Custom CSS with Nyght Serif and Geist
- Vercel Analytics
- Google Apps Script as the waitlist destination

## Local Development

Requirements:

- Node.js 20.9 or newer
- npm (included with Node.js)

Install dependencies and create the local environment file:

```bash
npm install
cp .env.example .env.local
```

Set the values in `.env.local`, then start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
| --- | --- | --- |
| `APPS_SCRIPT_URL` | Yes | Deployed Google Apps Script web app URL. Used only by the server. |
| `SHARED_SECRET` | Yes | Secret shared with the Apps Script deployment. Never expose it to client code. |
| `NEXT_PUBLIC_SITE_URL` | Yes in production | Canonical site origin used by metadata and Open Graph URLs. |
| `NEXT_PUBLIC_PHASEROLL_DOWNLOAD_URL` | Yes for shared links in production | App Store or TestFlight URL shown when PhaseRoll is not installed. Shared links fall back to the homepage waitlist when unset. |
| `BETTER_AUTH_URL` | Yes | Auth server origin, such as `https://www.phaseroll.com`. |
| `BETTER_AUTH_SECRET` | Yes | At least 32 random characters used to sign and encrypt auth data. |
| `POSTGRES_HOST` | Yes | PostgreSQL server hostname. |
| `POSTGRES_PORT` | Yes | PostgreSQL server port, normally `5432`. |
| `POSTGRES_DATABASE` | Yes | PostgreSQL database name. |
| `POSTGRES_USER` | Yes | PostgreSQL username. |
| `POSTGRES_PASSWORD` | Yes | PostgreSQL password. |
| `POSTGRES_SSL` | Yes in production | Set to `true` when the database requires TLS. |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth web application client ID. |
| `GOOGLE_CLIENT_SECRET` | Yes | Secret belonging to the Google web OAuth client. |
| `APPLE_CLIENT_ID` | Yes | Sign in with Apple Service ID, `com.phaseroll.phaseroll.auth`. |
| `APPLE_TEAM_ID` | Yes | Apple Developer team ID. |
| `APPLE_KEY_ID` | Yes | Identifier of the Sign in with Apple key. |
| `APPLE_PRIVATE_KEY` | Yes | Private `.p8` key for generating Apple client secrets. |
| `PHASEROLL_API_BASE_URL` | Yes | PhaseRoll API origin used by the account-deletion gate. |
| `PHASEROLL_ACCOUNT_DELETION_SERVICE_TOKEN` | Yes | Shared secret for internal account-deletion gate and finalization calls. |

The landing page still renders without the waitlist variables, but submissions
to `/api/waitlist` return an error until both server-side values are configured.

Generate the auth secret with `openssl rand -base64 32`.

## Better Auth Backend

Better Auth is mounted at `/api/auth/[...all]` and stores users, accounts, and
sessions in PostgreSQL. It enables Google and Apple and trusts the PhaseRoll
app's `phaseroll://` deep-link scheme. The marketing site intentionally has no
auth controls.

In Google Cloud Console, create a web application OAuth client. Add these
authorized redirect URIs to the client:

```text
http://localhost:3000/api/auth/callback/google
https://www.phaseroll.com/api/auth/callback/google
```

After filling the PostgreSQL and auth variables in `.env.local`, create the
Better Auth tables:

```bash
npx auth@latest migrate
```

The Expo app should use `https://www.phaseroll.com` as its Better Auth base URL,
the `@better-auth/expo/client` plugin with scheme `phaseroll`. Google returns its
OAuth flow through the trusted `phaseroll://` scheme; Apple uses the native
identity token flow.

The authenticated `POST /api/auth/apple-revoke` route verifies that a fresh
native Apple authorization belongs to the linked Better Auth account and revokes
the Apple token before permanent account deletion starts.

In Apple Developer, enable Sign in with Apple on `com.phaseroll.phaseroll`.
Create the `com.phaseroll.phaseroll.auth` Service ID with
`www.phaseroll.com` as a domain and
`https://www.phaseroll.com/api/auth/callback/apple` as a return URL. Create a
Sign in with Apple key for that primary App ID, download its `.p8` file, and add
the four Apple variables above to the production environment.

Check a deployed backend with `GET /api/auth/ok`; a healthy instance returns
`{ "ok": true }`.

## Google Sheets Waitlist

The browser posts email submissions to `app/api/waitlist/route.ts`; it never
contacts Google Apps Script directly. The route validates the email, checks a
honeypot field, applies an in-memory per-IP rate limit, and forwards this JSON:

```json
{
	"secret": "shared secret",
	"email": "person@example.com",
	"source": "hero"
}
```

### 1. Create the sheet

Create a Google Sheet and copy its ID from the URL:

```text
https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
```

The script below creates a `Waitlist` tab with these columns on the first
submission: `Submitted At`, `Email`, `Source`, and `Offer`. It de-duplicates
email addresses and marks the first 100 unique waitlist members as eligible for
`Founding Legacy - $100 lifetime + 1 Roll Call`.

### 2. Add the Apps Script

In the sheet, open **Extensions > Apps Script** and replace the editor contents
with:

```javascript
function jsonResponse(payload) {
	return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
		ContentService.MimeType.JSON,
	);
}

function doPost(event) {
	const lock = LockService.getScriptLock();

	try {
		lock.waitLock(10000);

		const properties = PropertiesService.getScriptProperties();
		const payload = JSON.parse(event.postData.contents);

		if (payload.secret !== properties.getProperty("SHARED_SECRET")) {
			return jsonResponse({ ok: false });
		}

		const email = String(payload.email || "").trim().toLowerCase();
		const source = String(payload.source || "landing").slice(0, 64);
		const spreadsheet = SpreadsheetApp.openById(
			properties.getProperty("SPREADSHEET_ID"),
		);
		const sheetName = properties.getProperty("SHEET_NAME") || "Waitlist";
		const sheet = spreadsheet.getSheetByName(sheetName) ||
			spreadsheet.insertSheet(sheetName);

		if (sheet.getLastRow() === 0) {
			sheet.appendRow(["Submitted At", "Email", "Source", "Offer"]);
			sheet.setFrozenRows(1);
		}

		const subscriberCount = Math.max(0, sheet.getLastRow() - 1);
		if (subscriberCount > 0) {
			const emails = sheet
				.getRange(2, 2, subscriberCount, 1)
				.getDisplayValues()
				.flat()
				.map(function (value) {
					return value.trim().toLowerCase();
				});

			if (emails.indexOf(email) !== -1) {
				return jsonResponse({ ok: true });
			}
		}

		const offer = subscriberCount < 100
			? "Founding Legacy - $100 lifetime + 1 Roll Call"
			: "";

		sheet.appendRow([new Date(), email, source, offer]);
		return jsonResponse({ ok: true });
	} catch (error) {
		console.error(error);
		return jsonResponse({ ok: false });
	} finally {
		lock.releaseLock();
	}
}
```

### 3. Configure script properties

Open **Project Settings > Script properties** and add:

| Property | Value |
| --- | --- |
| `SPREADSHEET_ID` | The ID copied from the Google Sheet URL. |
| `SHARED_SECRET` | A long random value, for example from `openssl rand -hex 32`. |
| `SHEET_NAME` | `Waitlist` (optional; this is the default). |

### 4. Deploy the web app

1. Select **Deploy > New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set **Who has access** to **Anyone**.
5. Deploy and copy the `/exec` web app URL.
6. If Google requests authorization, approve access to the target sheet.

### 5. Connect PhaseRoll

Put the deployment URL and the same secret in `.env.local`:

```bash
APPS_SCRIPT_URL=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
SHARED_SECRET=the-same-random-value
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Restart `npm run dev` after changing environment variables. Add the same values
to Vercel's project environment settings for production, then redeploy.

The Apps Script web app must remain publicly reachable because the Next.js
server calls it without a Google login. The shared secret authenticates those
requests and is never sent to the browser.

## Pricing

The landing page displays these launch prices:

| Plan | Price | Terms |
| --- | --- | --- |
| Free | $0 | Two active phases, voice memories, and one AI recap. |
| Pro monthly | $6/month | Flexible monthly access. |
| Pro annual | $48/year ($4/month) | Highlighted as the default. |
| Roll Call | $20/event | One event with up to 50 contributors. |
| Founding Legacy | $100 once | Lifetime access and one complimentary Roll Call for the first 100 waitlist members. |

## Product Mockups

Add exported app screens at:

```text
public/mockups/phase-view.png
public/mockups/camera.png
public/mockups/roll-call.png
```

Missing files automatically render as styled placeholders, so local development
does not depend on final product artwork.

## Project Commands

```bash
npm run dev       # Start the development server
npm run lint      # Run ESLint
npx tsc --noEmit  # Run the TypeScript checker
npm run build     # Create a production build
npm run start     # Serve the production build
```

## Deployment

Deploy the repository as a Next.js project on Vercel and configure all three
environment variables for the production environment. Update
`NEXT_PUBLIC_SITE_URL` to the final HTTPS origin before deployment so canonical
metadata and social previews use the correct URL.

Before publishing, run:

```bash
npm run lint
npx tsc --noEmit
npm run build
```

Do not run `npm audit fix --force` on this project. npm currently proposes a
breaking downgrade to Next.js 9, which is incompatible with React 19 and this
App Router codebase.
