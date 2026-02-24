/**
 * CheckboxDemo — visual test for all Checkbox states
 * Route: /demo/checkboxes
 */
import { useState } from 'react'
import Checkbox from '@/components/Checkbox'

export default function CheckboxDemo() {
  const [controlled, setControlled] = useState(false)
  const [multi, setMulti] = useState({ a: true, b: false, c: true })

  const allChecked = Object.values(multi).every(Boolean)
  const noneChecked = Object.values(multi).every((v) => !v)
  const someChecked = !allChecked && !noneChecked

  const handleParent = () => {
    const next = !allChecked
    setMulti({ a: next, b: next, c: next })
  }

  return (
    <div className="min-h-screen bg-wm-bg-01 p-8 font-sans">
      <h1 className="text-wm-text-01 text-2xl font-semibold mb-2">
        Checkbox Component
      </h1>
      <p className="text-wm-text-03 text-sm mb-10">
        Figma node: 31357-15191 — all states × values × label positions
      </p>

      {/* ── Values ────────────────────────────────────────────────────── */}
      <Section title="Values (default state)">
        <div className="flex flex-col gap-4 max-w-xs">
          <Checkbox
            label="Unchecked"
            description="Default empty state"
          />
          <Checkbox
            label="Checked"
            description="Value is true"
            defaultChecked
          />
          <Checkbox
            label="Indeterminate"
            description="Partial selection state"
            indeterminate
          />
        </div>
      </Section>

      {/* ── Disabled ──────────────────────────────────────────────────── */}
      <Section title="Disabled states">
        <div className="flex flex-col gap-4 max-w-xs">
          <Checkbox
            label="Disabled unchecked"
            description="Cannot be interacted with"
            disabled
          />
          <Checkbox
            label="Disabled checked"
            description="Locked in checked state"
            defaultChecked
            disabled
          />
          <Checkbox
            label="Disabled indeterminate"
            description="Locked in indeterminate state"
            indeterminate
            disabled
          />
        </div>
      </Section>

      {/* ── Label positions ────────────────────────────────────────────── */}
      <Section title="Label position">
        <div className="flex flex-col gap-4 max-w-xs">
          <Checkbox
            label="Label on the right (default)"
            description="Checkbox appears first"
            labelPosition="right"
            defaultChecked
          />
          <Checkbox
            label="Label on the left"
            description="Checkbox appears after the label"
            labelPosition="left"
            defaultChecked
          />
        </div>
      </Section>

      {/* ── No description ─────────────────────────────────────────────── */}
      <Section title="Without description">
        <div className="flex flex-col gap-3 max-w-xs">
          <Checkbox label="Unchecked, no description" />
          <Checkbox label="Checked, no description" defaultChecked />
          <Checkbox label="Disabled, no description" disabled />
        </div>
      </Section>

      {/* ── Controlled ────────────────────────────────────────────────── */}
      <Section title="Controlled example">
        <div className="max-w-xs flex flex-col gap-4">
          <Checkbox
            label="Controlled checkbox"
            description={controlled ? 'Currently checked ✓' : 'Currently unchecked'}
            checked={controlled}
            onChange={(e) => setControlled(e.target.checked)}
          />
          <p className="text-xs text-wm-text-03 font-mono">
            checked = {String(controlled)}
          </p>
        </div>
      </Section>

      {/* ── Parent / children (indeterminate pattern) ──────────────────── */}
      <Section title="Indeterminate parent pattern">
        <div className="max-w-xs flex flex-col gap-3">
          <Checkbox
            label="Select all"
            description={
              allChecked ? 'All items selected' :
              noneChecked ? 'No items selected' :
              'Some items selected'
            }
            checked={allChecked}
            indeterminate={someChecked}
            onChange={handleParent}
          />
          <div className="ml-6 flex flex-col gap-3 border-l border-wm-border-03 pl-4">
            {(['a', 'b', 'c'] as const).map((key) => (
              <Checkbox
                key={key}
                label={`Option ${key.toUpperCase()}`}
                checked={multi[key]}
                onChange={(e) =>
                  setMulti((prev) => ({ ...prev, [key]: e.target.checked }))
                }
              />
            ))}
          </div>
        </div>
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
