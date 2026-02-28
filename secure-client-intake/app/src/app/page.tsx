import Link from "next/link";

export default function LandingPage() {
  return (
    <main style={{ maxWidth: 860, margin: "40px auto", background: "white", padding: 28, borderRadius: 12 }}>
      <h1>Secure New Client Intake</h1>
      <p>Complete your onboarding using our encrypted intake workflow.</p>
      <ul>
        <li>Encrypted in transit and at rest</li>
        <li>Time-limited secure links</li>
        <li>Built for tax and accounting onboarding</li>
      </ul>
      <Link href="/intake" style={{ display: "inline-block", marginTop: 12, padding: "10px 14px", background: "#111", color: "#fff", borderRadius: 8, textDecoration: "none" }}>
        Start Secure Intake
      </Link>
      <p style={{ marginTop: 22, fontSize: 13, color: "#444" }}>
        Do not send SSNs or bank account data over regular email.
      </p>
    </main>
  );
}
