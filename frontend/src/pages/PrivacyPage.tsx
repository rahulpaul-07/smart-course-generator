import { CONTACT_EMAIL, LegalDocument } from '@/components/legal/LegalDocument';

/**
 * Written against what the code actually stores (backend/models, the auth
 * controller and the request logger). If you add a new data store, cookie or
 * third-party service, update this page in the same change.
 */
export default function PrivacyPage() {
  return (
    <LegalDocument
      title="Privacy policy"
      intro="CourseAI is an open-source learning project. This page lists what it stores about you, why, who else sees it and how to have it removed."
    >
      <h2>What we store</h2>
      <ul>
        <li>
          <strong>Account details.</strong> Your name and email address. If you sign up with a password, only a
          bcrypt hash of it is stored. If you sign in with Google or Auth0, no password is stored. For Google sign-in we also keep your Google account ID.
        </li>
        <li>
          <strong>Profile settings.</strong> Anything you choose to add: a bio, an avatar URL, learning interests, skill
          level, theme and time zone.
        </li>
        <li>
          <strong>Learning activity.</strong> The courses, lessons, roadmaps and mock interviews you generate, your
          progress and quiz answers, bookmarks, tutor conversations, study time, streaks, points and achievements.
        </li>
        <li>
          <strong>Server logs.</strong> Each request to the API is logged with your IP address, browser user agent, the
          path requested and the response status. We use these logs to debug errors and enforce rate limits.
        </li>
      </ul>
      <p>We do not use advertising or analytics trackers, and we do not sell or rent your data.</p>

      <h2>Cookies and browser storage</h2>
      <ul>
        <li>
          One <code>httpOnly</code> cookie holds your refresh token so you stay signed in. It is limited to the
          authentication endpoints and expires after 30 days, or when you sign out.
        </li>
        <li>
          Your browser&apos;s local storage holds a short-lived access token, your theme and sidebar preference.
          Session storage holds in-progress work, such as unsubmitted interview answers, and is cleared when you close
          the tab.
        </li>
        <li>
          Lessons can embed YouTube videos. YouTube may set its own cookies when you play one, under{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google&apos;s privacy policy</a>.
        </li>
      </ul>

      <h2>Who else processes your data</h2>
      <ul>
        <li>
          <strong>AI providers.</strong> To write a course, lesson or answer, the topic you enter and the relevant lesson
          text are sent to Google Gemini, Groq or OpenRouter, whichever is available. Your name and email are not included.
          Do not put personal or confidential information in a prompt.
        </li>
        <li>
          <strong>Hosting.</strong> The website is served by Vercel, the API runs on Render and data is stored in MongoDB
          Atlas.
        </li>
        <li>
          <strong>Sign-in providers.</strong> Google and Auth0, only if you choose to sign in with them.
        </li>
      </ul>

      <h2>What is public</h2>
      <p>Nothing, unless you make it so:</p>
      <ul>
        <li>Your profile is private until you turn on a public profile in settings.</li>
        <li>A course you share gets a link that anyone who has it can open.</li>
        <li>
          A certificate has a verification page, showing your name and the course, that anyone with its ID can open.
        </li>
      </ul>

      <h2>How long we keep it</h2>
      <ul>
        <li>Guest (demo) accounts, and everything created in them, are deleted automatically after 24 hours.</li>
        <li>Records of AI provider performance, which contain no personal data, are deleted after 30 days.</li>
        <li>Everything else is kept until you ask us to delete your account.</li>
      </ul>

      <h2>Your choices</h2>
      <p>
        To get a copy of your data, correct it or delete your account and everything in it, email{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> from the address on the account. We will act on it within
        30 days. You can change your profile and settings yourself at any time.
      </p>

      <h2>Children</h2>
      <p>CourseAI is not directed at children under 13, and we do not knowingly collect data from them.</p>

      <h2>Changes</h2>
      <p>
        If this policy changes, the date at the top will change with it. The full history is public in the project&apos;s
        GitHub repository.
      </p>
    </LegalDocument>
  );
}
