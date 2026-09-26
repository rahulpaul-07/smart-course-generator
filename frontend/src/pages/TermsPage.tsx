import { CONTACT_EMAIL, LegalDocument } from '@/components/legal/LegalDocument';

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of use"
      intro="These terms apply when you use the hosted CourseAI website. The source code itself is released separately under the MIT licence."
    >
      <h2>The service</h2>
      <p>
        CourseAI generates courses, lessons, quizzes, flashcards, roadmaps and mock interviews with large language models.
        It is a free, open-source project run by one person. It is provided as it is, with no guarantee that it will be
        available, error-free or kept running.
      </p>

      <h2>AI-generated content can be wrong</h2>
      <p>
        Everything CourseAI writes is produced by a model and can contain mistakes, outdated information or made-up
        details. Treat it as study material to verify, not as professional, medical, legal or financial advice. A
        CourseAI certificate shows that you passed a generated test. It is not an accredited qualification.
      </p>

      <h2>Your account</h2>
      <ul>
        <li>Keep your sign-in details to yourself. You are responsible for what happens under your account.</li>
        <li>Guest accounts are temporary and are deleted, with their content, after 24 hours.</li>
        <li>You can ask us to delete your account at any time. See the privacy policy.</li>
      </ul>

      <h2>Acceptable use</h2>
      <p>Do not use CourseAI to:</p>
      <ul>
        <li>generate unlawful, harassing or sexually explicit material, or content that infringes someone else&apos;s rights;</li>
        <li>try to get around rate limits, access other people&apos;s data or disrupt the service;</li>
        <li>send automated bulk requests, or resell access to the service;</li>
        <li>put other people&apos;s personal information into prompts.</li>
      </ul>
      <p>We may suspend or delete accounts that break these rules.</p>

      <h2>Your content</h2>
      <p>
        You keep whatever rights you have in the prompts you write and the courses generated for you. When you share a course
        or turn on a public profile, you allow anyone with access to view that content on CourseAI.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent the law allows, CourseAI and its maintainer are not liable for any loss arising from your use of the
        service or reliance on its content.
      </p>

      <h2>Changes and contact</h2>
      <p>
        If these terms change, the date at the top will change with it. Questions:{' '}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </p>
    </LegalDocument>
  );
}
