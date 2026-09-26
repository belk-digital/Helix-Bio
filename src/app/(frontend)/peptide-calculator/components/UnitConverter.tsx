'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FadeUp } from '@/components/motion/FadeUp'
import { RefreshCw, ArrowRight } from 'lucide-react'

// 'units' = U-100 syringe units (volume). 'IU' = international units (biological potency, NOT a mass).
type Unit = 'mg' | 'mcg' | 'IU' | 'mL' | 'units';

const MASS_GROUP: Unit[] = ['mg', 'mcg', 'IU'];
const VOLUME_GROUP: Unit[] = ['mL', 'units'];
const UNIT_LABEL: Record<Unit, string> = { mg: 'mg', mcg: 'mcg', IU: 'IU (potency)', mL: 'mL', units: 'syringe units' };

const DynamicInput = ({ value, onChange, minWidth = 2 }: { value: string, onChange: (v: string) => void, minWidth?: number }) => (
  <input 
    type="text" 
    value={value} 
    onChange={(e) => {
      const val = e.target.value;
      if (val === '' || /^[0-9]*\.?[0-9]*$/.test(val)) {
        onChange(val);
      }
    }} 
    className="bg-transparent border-b-2 border-black/10 hover:border-primary/50 text-primary focus:outline-none focus:border-primary px-1 mx-1 text-center font-black transition-colors inline-block"
    style={{ width: `${Math.max(minWidth, value.length || 1) + 0.5}ch` }}
  />
)

const DynamicSelect = ({ value, options, onChange }: { value: string, options: {label: string, value: string}[], onChange: (v: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLabel = options.find(o => o.value == value)?.label;

  return (
    <div className="relative inline-block mx-1" onMouseLeave={() => setIsOpen(false)}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-transparent border-b-2 border-black/10 hover:border-primary/50 text-primary focus:outline-none px-1 mx-1 font-black transition-colors flex items-center gap-1 inline-flex"
      >
        {selectedLabel}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}><path d="M6 9l6 6 6-6"/></svg>
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute top-full left-1/2 -translate-x-1/2 mt-3 bg-white rounded-2xl shadow-[0_20px_40px_rgb(0,0,0,0.1)] border border-black/5 overflow-hidden z-50 min-w-[120px]"
          >
            <div className="flex flex-col p-1">
              {options.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { onChange(String(opt.value)); setIsOpen(false); }}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-colors ${value == opt.value ? 'bg-primary text-white' : 'text-ink hover:bg-black/5'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function UnitConverter() {
  const [val, setVal] = useState('5');
  const [fromUnit, setFromUnit] = useState<Unit>('mg');
  const [toUnit, setToUnit] = useState<Unit>('mcg');
  // IU per 1 mg. Deliberately empty by default: the factor is specific to each compound and
  // reference standard, so it must come from the certificate of analysis / label, never a guess.
  const [iuPerMg, setIuPerMg] = useState('');

  const isMass = (u: Unit) => MASS_GROUP.includes(u);
  const toOptions = (list: Unit[]) => list.map((u) => ({ label: UNIT_LABEL[u], value: u }));

  const handleFromChange = (newFrom: string) => {
    const unit = newFrom as Unit;
    setFromUnit(unit);
    // Keep the "to" unit inside the same family (mass/potency vs volume) and never identical.
    const family = isMass(unit) ? MASS_GROUP : VOLUME_GROUP;
    if (!family.includes(toUnit) || toUnit === unit) setToUnit(family.find((u) => u !== unit) as Unit);
  }

  const usesIU = fromUnit === 'IU' || toUnit === 'IU';
  const factor = parseFloat(iuPerMg) || 0;
  const numericVal = parseFloat(val) || 0;
  let result = 0;
  let formattedResult = '—';

  if (numericVal > 0 && (!usesIU || factor > 0)) {
    if (isMass(fromUnit)) {
      // Normalise to mg, then out to the target.
      const mg = fromUnit === 'mg' ? numericVal : fromUnit === 'mcg' ? numericVal / 1000 : numericVal / factor;
      result = toUnit === 'mg' ? mg : toUnit === 'mcg' ? mg * 1000 : mg * factor;
    } else {
      // U-100 syringe: 1 mL = 100 units.
      result = fromUnit === 'mL' ? numericVal * 100 : numericVal / 100;
    }
    formattedResult = result.toLocaleString(undefined, { maximumFractionDigits: 3 });
  }

  const reset = () => { setVal('5'); setFromUnit('mg'); setToUnit('mcg'); setIuPerMg(''); }

  return (
    <section className="w-full rounded-3xl bg-white p-4 sm:p-6 md:p-12 lg:p-16 border border-black/5 shadow-[0_20px_60px_rgb(0,0,0,0.05)] relative z-10 flex flex-col lg:flex-row gap-8 lg:gap-20">

      {/* Left: Conversational Form */}
      <div className="flex-1 flex flex-col justify-center">
        <FadeUp>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-ink/30">Universal Converter</h2>
            <button
              onClick={reset}
              aria-label="Reset converter"
              className="w-8 h-8 rounded-full border border-black/10 hover:bg-black/5 flex items-center justify-center text-ink/40 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-2xl sm:text-3xl md:text-[2.5rem] font-heading font-light text-ink tracking-tight leading-[1.7] md:leading-[1.7] relative z-10">
            I want to convert <DynamicInput value={val} onChange={setVal} />
            <DynamicSelect
              value={fromUnit}
              onChange={handleFromChange}
              options={toOptions([...MASS_GROUP, ...VOLUME_GROUP])}
            />
            into
            <DynamicSelect
              value={toUnit}
              onChange={(v) => setToUnit(v as Unit)}
              options={toOptions((isMass(fromUnit) ? MASS_GROUP : VOLUME_GROUP).filter((u) => u !== fromUnit))}
            />.
          </div>

          {usesIU && (
            <div className="mt-8 rounded-2xl border border-black/5 bg-[#FAFAFA] p-5 max-w-xl">
              <label className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-ink/40">IU per 1 mg for this compound</span>
                <input
                  inputMode="decimal"
                  placeholder="e.g. 10"
                  value={iuPerMg}
                  onChange={(e) => { const v = e.target.value; if (v === '' || /^[0-9]*\.?[0-9]*$/.test(v)) setIuPerMg(v); }}
                  className="w-full bg-white border border-black/10 rounded-xl px-4 py-3 text-ink font-bold focus:outline-none focus:border-primary transition-colors"
                />
              </label>
              <p className="text-sm text-ink/50 leading-relaxed mt-3">
                An international unit (IU) measures biological activity, not weight, so the mg-to-IU factor is different for every
                compound and reference standard. Enter the IU-per-mg value stated on the certificate of analysis or product label —
                for example, a label of 10 IU per mg means 2 mg equals 20 IU.
              </p>
            </div>
          )}
        </FadeUp>
      </div>

      {/* Right: Result Display */}
      <div className="w-full lg:w-[450px] shrink-0">
        <FadeUp delay={0.2} className="h-full">
          <div className="bg-[#FAFAFA] rounded-2xl border border-black/5 p-8 md:p-12 flex flex-col items-center justify-center text-center h-full shadow-[inset_0_2px_20px_rgba(0,0,0,0.02)] min-h-[400px] relative">

            <h3 className="absolute top-8 font-black uppercase tracking-[0.2em] text-ink/30 text-xs">Converted Result</h3>

            {/* Visual Conversion Graphic */}
            <div className="flex items-center gap-6 text-ink/20 my-10">
               <div className="text-3xl font-black">{fromUnit}</div>
               <div className="w-20 h-px bg-ink/10 relative flex items-center justify-center">
                  <motion.div
                    animate={{ x: [-10, 10, -10] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                    className="absolute"
                  >
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </motion.div>
               </div>
               <div className="text-3xl font-black text-primary">{toUnit}</div>
            </div>

            <div className="relative w-full flex flex-col items-center">
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={formattedResult + toUnit}
                  initial={{ scale: 0.8, opacity: 0, y: 10 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.8, opacity: 0, y: -10 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="text-6xl md:text-7xl font-black text-primary tracking-tighter leading-none drop-shadow-sm mb-4"
                >
                  {formattedResult}
                </motion.div>
              </AnimatePresence>
              <div className="text-sm font-black uppercase tracking-widest text-ink/40">{UNIT_LABEL[toUnit]}</div>
            </div>

            {!isMass(fromUnit) && (
              <div className="absolute bottom-8 text-xs font-bold uppercase tracking-widest text-ink/30">
                Assumes U-100 Syringe
              </div>
            )}
            {usesIU && factor <= 0 && (
              <div className="absolute bottom-8 text-xs font-bold uppercase tracking-widest text-ink/30 px-6">
                Enter the IU-per-mg factor to convert
              </div>
            )}

          </div>
        </FadeUp>
      </div>

    </section>
  )
}
