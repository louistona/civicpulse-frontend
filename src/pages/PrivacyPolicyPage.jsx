import { useState } from "react";
import { Shield, MapPin, Camera, Database, Users, Scale, Mail, ChevronRight } from "lucide-react";

// this content has been corrected to match what CivicPulse actually
// does in its current deployed form. The version this was adapted from
// made several claims that didn't match the real app see inline notes
// below at each corrected point. A privacy policy that overstates its own
// protections is arguably worse than having none, since it gives users
// false confidence about data that is, in reality, exposed. Restyled to
// use the app's actual Tailwind tokens (primary/surface/bg/text-main/
// text-muted/border from tailwind.config.js) instead of a separate blue
// palette, so this reads as part of CivicPulse rather than a pasted-in page.

const SECTIONS = [
  { id: "who-we-are", label: "1. Who we are" },
  { id: "what-we-collect", label: "2. What we collect" },
  { id: "why-we-collect", label: "3. Why we collect it" },
  { id: "location-photos", label: "4. Location & photo data" },
  { id: "sharing", label: "5. Who we share data with" },
  { id: "retention", label: "6. How long we keep it" },
  { id: "your-rights", label: "7. Your rights" },
  { id: "verification", label: "8. Community verification" },
  { id: "children", label: "9. Age requirement" },
  { id: "security", label: "10. Security" },
  { id: "acceptable-use", label: "11. Acceptable use (EULA)" },
  { id: "liability", label: "12. Liability & disclaimer" },
  { id: "changes", label: "13. Changes to this policy" },
  { id: "contact", label: "14. Contact us" },
];

function Section({ id, icon: Icon, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 border-b border-border pb-8 mb-8 last:border-0">
      <div className="flex items-center gap-3 mb-3">
        {Icon && (
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <Icon size={18} />
          </div>
        )}
        <h2 className="text-lg font-semibold text-text-main">{title}</h2>
      </div>
      <div className="text-[15px] leading-relaxed text-text-main space-y-3 pl-0 sm:pl-12">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  const [active, setActive] = useState("who-we-are");

  return (
    <div className="min-h-screen bg-bg text-text-main">
      {/* Header */}
      <header className="bg-primary-dk text-white">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex items-center gap-2 text-[13px] uppercase tracking-wider text-white/70 mb-2">
            <Shield size={14} />
            <span>CivicPulse · Kigali City</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight">
            Privacy Policy &amp; Terms of Use
          </h1>
          <p className="mt-3 text-white/80 max-w-2xl text-[15px]">
            How CivicPulse collects, protects, and uses your data when you report an
            infrastructure issue written in plain language, in line with Rwanda's Law
            N° 058/2021 on the Protection of Personal Data and Privacy.
          </p>
          <p className="mt-4 text-xs text-white/60">Last updated: 26 July 2026 · Version 1.1</p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-[220px_1fr] gap-10">
        {/* Nav */}
        <nav className="md:sticky md:top-6 md:self-start">
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
            On this page
          </p>
          <ul className="space-y-1">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={() => setActive(s.id)}
                  className={`flex items-center gap-1.5 text-[13px] py-1.5 px-2 rounded-md transition-colors ${
                    active === s.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-text-muted hover:text-text-main hover:bg-surface"
                  }`}
                >
                  <ChevronRight size={12} className="shrink-0" />
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Content */}
        <main className="bg-surface rounded-lg border border-border px-6 sm:px-10 py-8">
          <Section id="who-we-are" icon={Users} title="1. Who we are">
            <p>
              CivicPulse is a civic-technology platform that lets residents of Kigali City
              report infrastructure deficiencies such as damaged roads, broken
              streetlights, or non-functioning water points and tracks how local
              government offices respond, through a public accountability scorecard.
            </p>
            <p>
              This policy explains what data we collect when you use CivicPulse, why we
              collect it, and the choices and rights you have over it.
            </p>
          </Section>

          <Section id="what-we-collect" icon={Database} title="2. What we collect">
            <p>
              CivicPulse does not require an account to submit a report. If you report
              without signing up, we collect only the report content described below and,
              optionally, a name and contact detail you choose to provide.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Account information (if you sign up):</strong> for citizens, your name, phone number, and a 4-digit PIN, verified via a one-time SMS code; for government officials, your name, work email, and a password. All PINs and passwords are stored as a salted hash, never in plain text.</li>
              <li><strong>Report content:</strong> a title, description, category, severity rating, and a required photo.</li>
              <li><strong>Location data:</strong> the map coordinates of the issue, captured at the moment you place a pin.</li>
              <li><strong>Votes:</strong> if you vote on a report's severity or on whether a resolution was genuine, we record that vote and, for anonymous voters, a non-reversible fingerprint (derived from your IP address and browser) used only to prevent the same visitor voting twice on the same report.</li>
            </ul>
            <p>We do not ask for or store national ID numbers, financial information, or health information.</p>
          </Section>

          <Section id="why-we-collect" icon={Scale} title="3. Why we collect it">
            <p>
              We process your data to operate the core function of CivicPulse: routing
              your report to the correct district office, calculating its priority using
              our community-weighted severity model, and displaying reports on the public
              heatmap and accountability scorecard. This is our lawful basis for processing
              under Rwanda's Law N° 058/2021 relating to the Protection of Personal Data and
              Privacy namely, performance of the service you've requested and our
              legitimate interest in improving public infrastructure accountability.
            </p>
          </Section>

          <Section id="location-photos" icon={MapPin} title="4. Location & photo data">
            <p>
              CivicPulse is a <em>public</em> reporting tool by design: the location and
              photo of every report are visible to any visitor on the map, the report
              detail page, and the heatmap, without needing to log in. This is what makes
              the accountability scorecard and heatmap work, but it also means you should
              not report an issue at a location that could identify you personally (for
              example, directly outside your own front door) if you'd prefer that
              connection not to be public.
            </p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>The exact map coordinates you pin are shown publicly on the report they are <strong>not</strong> generalised or blurred to a wider area.</li>
              <li>We use your pin's location only to automatically determine the nearest administrative cell, so we can notify nearby registered residents and the relevant district office this detection happens on our server and does not publish anything beyond the pin you already placed.</li>
              <li>Uploaded photos may still contain embedded metadata (such as GPS location or device information) from the device that took them, depending on your photo storage provider's settings. If you want to be cautious, avoid photos taken with location tagging enabled, or crop/re-save the image before uploading.</li>
              <li>We do not currently run automated screening of uploaded photos for identifiable faces, license plates, or similar, please avoid including bystanders or identifiable third parties in your photo where possible.</li>
            </ul>
          </Section>

          <Section id="sharing" icon={Camera} title="5. Who we share data with">
            <p>We do not sell your data. We share limited data with the following categories of processor, solely to run the service:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Hosting providers</strong> for our database, application server, and frontend, who store data on our behalf under contract. Some may be located outside Rwanda; where this happens, we rely on the cross-border transfer safeguards required by Rwandan law.</li>
              <li><strong>Photo storage provider</strong>, who hosts uploaded report and resolution photos.</li>
              <li><strong>SMS and email delivery providers</strong>, used to send one-time verification codes, cell-level alerts about new reports, and notifications to district officials. These providers only receive the phone number, email address, and message content necessary to deliver that specific notification.</li>
              <li><strong>Relevant district offices</strong>, who receive the report content and location needed to act on it.</li>
              <li><strong>Law enforcement or regulators</strong>, only where we are legally compelled to disclose information.</li>
            </ul>
          </Section>

          <Section id="retention" icon={Database} title="6. How long we keep it">
            <p>
              Report data is retained for as long as needed to resolve the issue and for a
              limited period afterwards for accountability-scorecard history. Account data
              is kept until you delete your account. You can request earlier deletion at
              any time (see Section 7).
            </p>
          </Section>

          <Section id="your-rights" icon={Shield} title="7. Your rights">
            <p>Under Rwandan data protection law, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Access the personal data we hold about you</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your account and associated personal data</li>
              <li>Object to further processing of your data</li>
              <li>Withdraw consent at any time, without affecting reports already resolved</li>
            </ul>
            <p>To exercise any of these rights, contact us using the details in Section 14.</p>
          </Section>

          <Section id="verification" icon={Scale} title="8. Community verification">
            <p>
              Reports are published immediately on submission, there is no pre-publication
              review. Severity is initially set by the person reporting, and is then refined
              in real time as other residents vote on whether they agree the issue is as
              serious as described. This weighted community input, not a single report, is
              what drives an issue's priority on the public heatmap and scorecard.
            </p>
            <p>
              We reserve the right to remove reports or suspend accounts used in bad faith —
              for example, deliberately false reports or coordinated vote manipulation — but
              this is not currently an automated process.
            </p>
          </Section>

          <Section id="children" icon={Users} title="9. Age requirement">
            <p>
              CivicPulse is intended for users aged 18 and over. We do not knowingly
              collect data from minors. If you believe a minor has created an account,
              please contact us so we can remove it.
            </p>
          </Section>

          <Section id="security" icon={Shield} title="10. Security">
            <p>
              We use industry-standard safeguards — encrypted connections, access-controlled
              databases, and hashed credentials — to protect your data, and we are working
              toward formal alignment with ISO/IEC 27001 information-security practices as
              the platform matures.
            </p>
          </Section>

          <Section id="acceptable-use" icon={Scale} title="11. Acceptable use (End User License Agreement)">
            <p>By using CivicPulse, you agree to:</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Submit reports in good faith and to the best of your knowledge accurate</li>
              <li>Not impersonate another resident, official, or organisation</li>
              <li>Not use the platform to harass, defame, or target any individual official rather than report a genuine infrastructure issue</li>
              <li>Not attempt to circumvent moderation, security, or rate-limiting controls</li>
            </ul>
            <p>
              We grant you a limited, non-exclusive, revocable license to use CivicPulse
              for its intended civic-reporting purpose. Accounts used to violate these
              terms may be suspended or removed.
            </p>
          </Section>

          <Section id="liability" icon={Scale} title="12. Liability & disclaimer">
            <p>
              CivicPulse is a reporting and transparency tool. We do not guarantee that a
              reported issue will be resolved by a district office within any particular
              timeframe, and we are not liable for district offices' action or inaction.
              The platform is provided "as is," without warranty of any kind.
            </p>
          </Section>

          <Section id="changes" icon={Database} title="13. Changes to this policy">
            <p>
              We may update this policy as CivicPulse evolves. Material changes will be
              posted on this page with an updated "Last updated" date, and where the change
              significantly affects your rights, we will make reasonable efforts to notify
              registered users directly by SMS or email before it takes effect.
            </p>
          </Section>

          <Section id="contact" icon={Mail} title="14. Contact us">
            <p>
              Questions, corrections, or data requests can be sent to{" "}
              <a href="mailto:l.tona@alustudent.com" className="text-primary font-medium hover:underline">
                l.tona@alustudent.com
              </a>.
            </p>
          </Section>
        </main>
      </div>
    </div>
  );
}
