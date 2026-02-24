/**
 * InputDemo — visual test for all Input states × sizes
 * Route: /demo/inputs
 */
import { useState } from 'react'
import InputField from '@/components/Input'
import { SearchLine, User1Line, LockFill } from '@mingcute/react'

export default function InputDemo() {
  const [controlled, setControlled] = useState('')

  return (
    <div className="min-h-screen bg-wm-bg-01 p-8 font-sans">
      <h1 className="text-wm-text-01 text-2xl font-semibold mb-2">
        Input Component
      </h1>
      <p className="text-wm-text-03 text-sm mb-10">
        Figma node: 31375-266 — all states × sizes × content variants
      </p>

      {/* ── Sizes ──────────────────────────────────────────────────── */}
      <Section title="Sizes (md / lg)">
        <Grid>
          <InputField
            size="md"
            label="Size MD"
            placeholder="Placeholder"
            helperText="Helper text"
            showCharCount
            maxLength={40}
          />
          <InputField
            size="lg"
            label="Size LG"
            placeholder="Placeholder"
            helperText="Helper text"
            showCharCount
            maxLength={40}
          />
        </Grid>
      </Section>

      {/* ── States ─────────────────────────────────────────────────── */}
      <Section title="States (md)">
        <Grid>
          {/* Default (empty → bg-02) */}
          <InputField
            label="Default"
            placeholder="Placeholder"
            helperText="We'll never share your details"
          />

          {/* Has-value (blurred + non-empty → bg-overlay) */}
          <InputField
            label="Has Value"
            defaultValue="john.doe@example.com"
            helperText="Background changes to bg-overlay when blurred + filled"
          />

          {/* Invalid */}
          <InputField
            label="Invalid"
            status="invalid"
            defaultValue="bad@value"
            statusMessage="The values do not match"
          />

          {/* Success */}
          <InputField
            label="Success"
            status="success"
            defaultValue="john.doe@example.com"
            statusMessage="Looks good!"
          />

          {/* Loading */}
          <InputField
            label="Loading"
            status="loading"
            defaultValue="Verifying…"
            helperText="Checking availability"
          />

          {/* Disabled */}
          <InputField
            label="Disabled"
            placeholder="Placeholder"
            helperText="This field is disabled"
            disabled
          />

          {/* Read-only */}
          <InputField
            label="Read-only"
            defaultValue="readonly@example.com"
            helperText="Cannot be edited"
            readOnly
          />
        </Grid>
      </Section>

      {/* ── Required ───────────────────────────────────────────────── */}
      <Section title="Required indicator">
        <Grid>
          <InputField
            label="Email"
            required
            placeholder="you@example.com"
            helperText="Required field"
          />
          <InputField
            label="Password"
            required
            type="password"
            placeholder="••••••••"
            status="invalid"
            statusMessage="Password is too short"
          />
        </Grid>
      </Section>

      {/* ── Leading icons ──────────────────────────────────────────── */}
      <Section title="Leading icons">
        <Grid>
          <InputField
            label="Search"
            placeholder="Search anything..."
            leadingIcon={<SearchLine size={20} />}
          />
          <InputField
            label="Username"
            placeholder="Enter username"
            leadingIcon={<User1Line size={20} />}
            defaultValue="johndoe"
          />
          <InputField
            label="Password"
            type="password"
            placeholder="••••••••"
            leadingIcon={<LockFill size={20} />}
            status="invalid"
            statusMessage="Password is incorrect"
          />
          <InputField
            label="Email (success)"
            placeholder="you@example.com"
            leadingIcon={<User1Line size={20} />}
            status="success"
            statusMessage="Email verified!"
            defaultValue="hello@example.com"
          />
        </Grid>
      </Section>

      {/* ── Char counter ───────────────────────────────────────────── */}
      <Section title="Character counter">
        <Grid>
          <InputField
            label="Username"
            placeholder="Choose a username"
            showCharCount
            maxLength={20}
            helperText="3–20 characters"
          />
          <InputField
            label="Bio"
            placeholder="Tell us about yourself"
            showCharCount
            maxLength={140}
            helperText="Keep it short"
          />
        </Grid>
      </Section>

      {/* ── No header / no footer ──────────────────────────────────── */}
      <Section title="No header / no footer">
        <Grid>
          <InputField
            placeholder="Input without label or footer"
            showHeader={false}
            showFooter={false}
          />
          <InputField
            label="Label only"
            placeholder="No footer"
            showFooter={false}
          />
          <InputField
            placeholder="Footer only (no label)"
            showHeader={false}
            helperText="Helper text visible"
          />
        </Grid>
      </Section>

      {/* ── Controlled example ─────────────────────────────────────── */}
      <Section title="Controlled input (live char count)">
        <div className="max-w-sm">
          <InputField
            label="Message"
            placeholder="Type something…"
            value={controlled}
            onChange={(e) => setControlled(e.target.value)}
            showCharCount
            maxLength={60}
            helperText={
              controlled.length === 0
                ? 'Start typing to see bg change'
                : controlled.length >= 60
                ? 'Character limit reached!'
                : `${60 - controlled.length} characters remaining`
            }
            status={controlled.length >= 60 ? 'invalid' : 'default'}
          />
          <p className="mt-3 text-xs text-wm-text-03 font-mono">
            value = "{controlled}"
          </p>
        </div>
      </Section>

      {/* ── All statuses in lg ─────────────────────────────────────── */}
      <Section title="All statuses — LG size">
        <Grid>
          <InputField
            size="lg"
            label="Default"
            placeholder="Placeholder"
          />
          <InputField
            size="lg"
            label="Invalid"
            status="invalid"
            defaultValue="wrong value"
            statusMessage="That doesn't look right"
          />
          <InputField
            size="lg"
            label="Success"
            status="success"
            defaultValue="correct@value.com"
            statusMessage="All good!"
          />
          <InputField
            size="lg"
            label="Loading"
            status="loading"
            defaultValue="Loading…"
          />
        </Grid>
      </Section>
    </div>
  )
}

function Section({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="mb-10">
      <h2 className="text-wm-text-02 text-sm font-semibold mb-4 pb-2 border-b border-wm-border-02">
        {title}
      </h2>
      {children}
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  )
}
