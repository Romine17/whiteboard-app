"use client";

import { useState } from "react";

type FormState = Record<string, string | boolean>;

const initialState: FormState = {
  taxpayerFullName: "",
  taxpayerDob: "",
  taxpayerSsn: "",
  taxpayerCellPhone: "",
  taxpayerEmail: "",
  currentStreetAddress: "",
  currentCity: "",
  currentState: "",
  currentZip: "",
  spouseName: "",
  spouseDob: "",
  spouseSsn: "",
  directDepositRefund: false,
  bankAccountType: "",
  bankAccountNumber: "",
  bankRoutingNumber: "",
  referredBy: "",
};

export default function IntakePage() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState("idle");

  const update = (key: string, value: string | boolean) => setForm((p) => ({ ...p, [key]: value }));

  async function submit() {
    setStatus("saving");
    const res = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "saved" : "error");
  }

  return (
    <main style={{ maxWidth: 860, margin: "20px auto", background: "white", padding: 24, borderRadius: 12 }}>
      <h1>Secure Intake Form</h1>
      <p style={{ color: "#555" }}>Fields below are scaffolded from New Client Sheet. Sensitive values should be encrypted server-side.</p>

      <section>
        <h3>Taxpayer</h3>
        <input placeholder="Full Name" onChange={(e) => update("taxpayerFullName", e.target.value)} />
        <input placeholder="DOB" onChange={(e) => update("taxpayerDob", e.target.value)} />
        <input placeholder="SSN" onChange={(e) => update("taxpayerSsn", e.target.value)} />
        <input placeholder="Cell" onChange={(e) => update("taxpayerCellPhone", e.target.value)} />
        <input placeholder="Email" onChange={(e) => update("taxpayerEmail", e.target.value)} />
      </section>

      <section>
        <h3>Address</h3>
        <input placeholder="Street" onChange={(e) => update("currentStreetAddress", e.target.value)} />
        <input placeholder="City" onChange={(e) => update("currentCity", e.target.value)} />
        <input placeholder="State" onChange={(e) => update("currentState", e.target.value)} />
        <input placeholder="ZIP" onChange={(e) => update("currentZip", e.target.value)} />
      </section>

      <section>
        <h3>Refund Banking</h3>
        <label>
          <input type="checkbox" onChange={(e) => update("directDepositRefund", e.target.checked)} /> Use direct deposit
        </label>
        <input placeholder="Account Type" onChange={(e) => update("bankAccountType", e.target.value)} />
        <input placeholder="Account Number" onChange={(e) => update("bankAccountNumber", e.target.value)} />
        <input placeholder="Routing Number" onChange={(e) => update("bankRoutingNumber", e.target.value)} />
      </section>

      <button onClick={submit} style={{ marginTop: 16, padding: "10px 14px" }}>Submit Secure Intake</button>
      <p>Status: {status}</p>
    </main>
  );
}
