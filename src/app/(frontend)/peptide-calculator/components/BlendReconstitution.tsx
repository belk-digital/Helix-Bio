'use client'

import React, { useState } from 'react'
import { FadeUp } from '@/components/motion/FadeUp'
import { Plus, Trash2, RefreshCw } from 'lucide-react'

type BlendComponent = { id: number; name: string; mg: string }
type MassUnit = 'mg' | 'mcg'

const MAX_COMPONENTS = 6

const numericOnly = (v: string) => v === '' || /^[0-9]*\.?[0-9]*$/.test(v)

const fmt = (n: number, digits = 3) => n.toLocaleString(undefined, { maximumFractionDigits: digits })

const fieldClass =
  'w-full bg-[#FAFAFA] border border-black/10 rounded-xl px-4 py-3 text-ink font-bold focus:outline-none focus:border-primary transition-colors'

/**
 * Reconstitution math for a multi-peptide (blend) vial. Every component shares the same diluent
 * volume, so each has its own concentration (mg ÷ mL) and a single draw delivers all components in
 * fixed proportion. The mg amount of each component must be taken from the product's own
 * documentation/COA — nothing is assumed here. Arithmetic only; no dosing guidance.
 */
export function BlendReconstitution() {
  const [components, setComponents] = useState<BlendComponent[]>([
    { id: 1, name: 'Component A', mg: '10' },
    { id: 2, name: 'Component B', mg: '5' },
  ])
  const [waterMl, setWaterMl] = useState('2')
  const [targetId, setTargetId] = useState<number>(1)
  const [dose, setDose] = useState('250')
  const [doseUnit, setDoseUnit] = useState<MassUnit>('mcg')
  const [nextId, setNextId] = useState(3)

  const water = parseFloat(waterMl) || 0
  const doseMcg = (parseFloat(dose) || 0) * (doseUnit === 'mg' ? 1000 : 1)
  const target = components.find((c) => c.id === targetId) ?? components[0]
  const targetMcg = (parseFloat(target?.mg ?? '') || 0) * 1000

  const valid = water > 0 && doseMcg > 0 && targetMcg > 0
  const drawMl = valid ? doseMcg / (targetMcg / water) : 0
  const units = drawMl * 100 // U-100 syringe: 100 units per mL
  const totalMg = components.reduce((sum, c) => sum + (parseFloat(c.mg) || 0), 0)

  const update = (id: number, patch: Partial<BlendComponent>) =>
    setComponents((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const add = () => {
    if (components.length >= MAX_COMPONENTS) return
    setComponents((prev) => [...prev, { id: nextId, name: `Component ${String.fromCharCode(64 + nextId)}`, mg: '' }])
    setNextId((n) => n + 1)
  }

  const remove = (id: number) => {
    if (components.length <= 2) return
    setComponents((prev) => prev.filter((c) => c.id !== id))
    if (targetId === id) setTargetId(components.find((c) => c.id !== id)!.id)
  }

  const reset = () => {
    setComponents([
      { id: 1, name: 'Component A', mg: '10' },
      { id: 2, name: 'Component B', mg: '5' },
    ])
    setNextId(3)
    setWaterMl('2')
    setTargetId(1)
    setDose('250')
    setDoseUnit('mcg')
  }

  return (
    <section className="w-full rounded-3xl bg-white p-4 sm:p-6 md:p-12 lg:p-16 border border-black/5 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-16">
      {/* Left: inputs */}
      <div className="flex-1 flex flex-col gap-8">
        <FadeUp>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink/30">Blend Vial Reconstitution</h2>
            <button
              onClick={reset}
              aria-label="Reset blend calculator"
              className="w-8 h-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center text-ink/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-ink/60 leading-relaxed">
            A blend vial holds several peptides. Enter the mg of each component from the product&apos;s documentation or
            certificate of analysis, the bacteriostatic water added, and the amount of one component you want to measure.
            Because all components share the same volume, one draw contains every component in fixed proportion.
          </p>
        </FadeUp>

        <FadeUp delay={0.1}>
          <h3 className="text-xs font-black uppercase tracking-[0.2em] text-ink/40 mb-4">Components in the vial</h3>
          <div className="flex flex-col gap-3">
            {components.map((c) => (
              <div key={c.id} className="grid grid-cols-[1fr_110px_auto] gap-3 items-center">
                <input
                  aria-label="Component name"
                  className={fieldClass}
                  value={c.name}
                  onChange={(e) => update(c.id, { name: e.target.value.slice(0, 40) })}
                />
                <div className="relative">
                  <input
                    aria-label={`${c.name} amount in mg`}
                    inputMode="decimal"
                    className={fieldClass + ' pr-10'}
                    value={c.mg}
                    onChange={(e) => numericOnly(e.target.value) && update(c.id, { mg: e.target.value })}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-ink/40 text-sm font-bold">mg</span>
                </div>
                <button
                  onClick={() => remove(c.id)}
                  disabled={components.length <= 2}
                  aria-label={`Remove ${c.name}`}
                  className="w-10 h-10 rounded-full border border-black/10 hover:bg-black/5 disabled:opacity-30 flex items-center justify-center text-ink/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          {components.length < MAX_COMPONENTS && (
            <button onClick={add} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
              <Plus className="w-4 h-4" /> Add component
            </button>
          )}
          <p className="text-xs text-ink/40 font-bold uppercase tracking-widest mt-4">Total in vial: {fmt(totalMg)} mg</p>
        </FadeUp>

        <FadeUp delay={0.2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">Bacteriostatic water (mL)</span>
              <input inputMode="decimal" className={fieldClass} value={waterMl} onChange={(e) => numericOnly(e.target.value) && setWaterMl(e.target.value)} />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">Measure this component</span>
              <select className={fieldClass} value={target?.id} onChange={(e) => setTargetId(Number(e.target.value))}>
                {components.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 sm:col-span-2">
              <span className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">Amount of that component</span>
              <div className="flex gap-3">
                <input inputMode="decimal" className={fieldClass} value={dose} onChange={(e) => numericOnly(e.target.value) && setDose(e.target.value)} />
                <select className={fieldClass + ' max-w-[110px]'} value={doseUnit} onChange={(e) => setDoseUnit(e.target.value as MassUnit)}>
                  <option value="mcg">mcg</option>
                  <option value="mg">mg</option>
                </select>
              </div>
            </label>
          </div>
        </FadeUp>
      </div>

      {/* Right: result */}
      <div className="w-full lg:w-[450px] shrink-0">
        <FadeUp delay={0.2} className="h-full">
          <div className="bg-[#FAFAFA] rounded-2xl border border-black/5 p-8 md:p-10 h-full min-h-[400px] flex flex-col">
            <h3 className="font-black uppercase tracking-[0.2em] text-ink/30 text-xs mb-6 text-center">Calculated Draw</h3>
            {valid ? (
              <>
                <div className="text-center mb-6">
                  <div className="text-6xl md:text-7xl font-black text-primary tracking-tighter leading-none">{fmt(units, 1)}</div>
                  <div className="text-sm font-black uppercase tracking-widest text-ink/40 mt-3">
                    units on a U-100 syringe ({fmt(drawMl)} mL)
                  </div>
                </div>
                <div className="border-t border-black/5 pt-5">
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-ink/40 mb-3">Each component in that draw</h4>
                  <ul className="flex flex-col gap-2">
                    {components.map((c) => {
                      const mg = parseFloat(c.mg) || 0
                      const conc = water > 0 ? mg / water : 0
                      return (
                        <li key={c.id} className="flex justify-between gap-4 text-sm">
                          <span className="font-bold text-ink">{c.name}</span>
                          <span className="text-ink/60 text-right">
                            {fmt(conc * drawMl * 1000, 1)} mcg <span className="text-ink/30">· {fmt(conc, 2)} mg/mL</span>
                          </span>
                        </li>
                      )
                    })}
                  </ul>
                </div>
              </>
            ) : (
              <p className="m-auto text-center text-ink/40 text-sm max-w-[240px]">
                Enter the water volume, the mg of the selected component, and the amount to measure.
              </p>
            )}
            <p className="text-[10px] text-ink/30 font-bold uppercase tracking-widest leading-relaxed mt-auto pt-6 text-center">
              Research-use calculation only. Verify component amounts against the batch certificate of analysis.
            </p>
          </div>
        </FadeUp>
      </div>
    </section>
  )
}
