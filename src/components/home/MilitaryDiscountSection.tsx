'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, IdCard, User, Mail, ChevronsUp, ChevronDown, Upload, CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { FluidButton } from '@/components/ui/fluid-button';

export function MilitaryDiscountSection() {
  const t = useTranslations('home.militaryDiscount')
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const militaryImages = [
    '/HelixBio Images/military-1.webp',
    '/HelixBio Images/military-2.webp',
    '/HelixBio Images/military-3.webp'
  ];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % militaryImages.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  const branches = [
    { id: 'army', key: 'army' },
    { id: 'navy', key: 'navy' },
    { id: 'airforce', key: 'airforce' },
    { id: 'marines', key: 'marines' },
    { id: 'coastguard', key: 'coastguard' },
    { id: 'spaceforce', key: 'spaceforce' },
    { id: 'other', key: 'other' }
  ];

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFile) {
      alert("Please upload your ID photo.");
      return;
    }
    
    // 5MB limit to prevent server overload
    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("Your ID photo is too large. Please upload an image smaller than 5MB.");
      return;
    }
    if (!selectedBranch) {
      alert("Please select a service branch.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("branch", selectedBranch);
    formData.append("idPhoto", selectedFile);

    setIsLoading(true);
    try {
      const res = await fetch('/api/military/submit', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setIsSubmitted(true);
      } else {
        alert("There was an error submitting your application. Please try again.");
      }
    } catch (err) {
      alert("An unexpected error occurred.");
    }
    setIsLoading(false);
  };

  return (
    <section className="bg-[#FAFAFA] py-16 md:py-24 relative font-sans overflow-hidden">
      <div className="container mx-auto px-4 md:px-10 max-w-[120rem]">
        
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12 items-stretch">
          
          {/* Left Column: Image with Badge */}
          <div className="w-full lg:w-[45%] relative rounded-[24px] md:rounded-[32px] overflow-hidden min-h-[550px] md:min-h-[600px] lg:min-h-[650px] shadow-md group order-2 lg:order-1">
            <div className="absolute top-6 left-6 md:top-8 md:left-8 z-20 bg-white/90 backdrop-blur-md px-5 py-2.5 md:px-6 md:py-3 rounded-2xl shadow-sm border border-white/60">
              <span className="text-ink font-bold text-sm tracking-tight flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" /> Honoring Our Heroes
              </span>
            </div>
            <AnimatePresence>
              <motion.div
                key={currentImageIndex}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0"
              >
                <Image 
                  src={militaryImages[currentImageIndex]} 
                  alt="Military Discount" 
                  fill 
                  className="object-cover transition-transform duration-1000 group-hover:scale-105"
                  priority={currentImageIndex === 0}
                />
              </motion.div>
            </AnimatePresence>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60 pointer-events-none" />
            
            {/* Privacy Notice inside the image card for a magazine feel */}
            <div className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-8 md:right-8 z-20 bg-white/95 backdrop-blur-md border border-white/60 shadow-lg rounded-2xl p-5 md:p-6 transition-transform duration-500 group-hover:-translate-y-2">
              <div className="flex items-start gap-4">
                <div className="mt-0.5 bg-primary/10 p-2.5 rounded-full text-primary">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-ink font-black text-sm tracking-[0.1em] uppercase mb-1">
                    {t('privacyNoticeTitle')}
                  </h3>
                  <p className="text-ink/70 text-xs leading-relaxed font-medium">
                    {t.rich('privacyNoticeText', {
                      redact: (chunks) => <span className="font-bold text-ink">{chunks}</span>,
                      destroyed: (chunks) => <span className="font-bold text-primary">{chunks}</span>
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Content & Form */}
          <div className="w-full lg:w-[55%] flex flex-col py-4 lg:py-0 lg:pl-8 order-1 lg:order-2">
             {/* Text Content */}
             <motion.div
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6 }}
               className="mb-10"
             >
               <span className="text-primary text-xs sm:text-sm font-bold tracking-[0.2em] uppercase mb-4 block">
                 {t('eyebrow')}
               </span>
               <h2 className="text-4xl md:text-5xl lg:text-6xl font-black font-heading uppercase leading-[1.05] tracking-tighter mb-6 text-ink">
                 {t('titleLine1')} <br /> {t('titleLine2')}
               </h2>
               <p className="text-ink/60 text-base md:text-lg leading-relaxed font-medium w-full lg:max-w-[85%]">
                 {t('description')}
               </p>
             </motion.div>

             {/* Form Card */}
             <motion.div
               initial={{ opacity: 0, x: 20 }}
               whileInView={{ opacity: 1, x: 0 }}
               viewport={{ once: true }}
               transition={{ duration: 0.6, delay: 0.2 }}
               className="bg-white rounded-[24px] md:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-black/5 relative w-full mt-auto"
             >
               <AnimatePresence mode="wait">
                 {!isSubmitted ? (
                   <motion.form 
                     key="form"
                     onSubmit={handleSubmit}
                     initial={{ opacity: 0 }}
                     animate={{ opacity: 1 }}
                     exit={{ opacity: 0, y: -20 }}
                     className="flex flex-col gap-5 relative z-10"
                   >
                     <h3 className="text-xl md:text-2xl font-black font-heading text-ink uppercase tracking-tighter mb-2">
                       {t('formTitle')}
                     </h3>

                     {/* Input Group */}
                     <div className="space-y-5 pt-2">
                       
                       {/* Full Name */}
                       <div className="flex flex-col gap-1.5 w-full">
                         <label htmlFor="fullName" className="text-[10px] font-bold text-ink/60 uppercase tracking-widest pl-1">
                           {t('fullNameLabel')}
                         </label>
                         <div className="relative flex items-center bg-black/[0.03] hover:bg-black/[0.05] rounded-2xl overflow-hidden focus-within:bg-black/[0.05] focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
                           <input 
                             required 
                             type="text" 
                             name="fullName" 
                             id="fullName"
                             placeholder={t('fullNamePlaceholder')} 
                             className="w-full bg-transparent px-5 py-4 outline-none text-sm font-semibold text-ink placeholder:text-ink/30" 
                           />
                         </div>
                       </div>

                       {/* Email */}
                       <div className="flex flex-col gap-1.5 w-full">
                         <label htmlFor="email" className="text-[10px] font-bold text-ink/60 uppercase tracking-widest pl-1">
                           {t('emailLabel')}
                         </label>
                         <div className="relative flex items-center bg-black/[0.03] hover:bg-black/[0.05] rounded-2xl overflow-hidden focus-within:bg-black/[0.05] focus-within:ring-1 focus-within:ring-primary/20 transition-all duration-300">
                           <input 
                             required 
                             type="email" 
                             name="email" 
                             id="email"
                             placeholder={t('emailPlaceholder')} 
                             className="w-full bg-transparent px-5 py-4 outline-none text-sm font-semibold text-ink placeholder:text-ink/30" 
                           />
                         </div>
                       </div>

                       {/* Service Branch Custom Dropdown */}
                       <div className="flex flex-col gap-1.5 w-full relative z-[100]" ref={dropdownRef}>
                         <label className="text-[10px] font-bold text-ink/60 uppercase tracking-widest pl-1">
                           {t('serviceBranchLabel')}
                         </label>
                         <div 
                           className="relative flex items-center justify-between bg-black/[0.03] hover:bg-black/[0.05] rounded-2xl px-5 py-4 cursor-pointer transition-all duration-300 group"
                           onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                         >
                           <span className={`text-sm ${selectedBranch ? 'text-ink font-semibold' : 'text-ink/40 font-medium'}`}>
                             {selectedBranch ? t(`branches.${branches.find(b => b.id === selectedBranch)?.key}`) : t('selectBranchPlaceholder')}
                           </span>
                           <ChevronDown className={`w-4 h-4 text-ink/40 transition-transform duration-300 group-hover:text-ink ${isDropdownOpen ? 'rotate-180' : ''}`} />
                         </div>

                         <AnimatePresence>
                           {isDropdownOpen && (
                             <motion.div 
                               initial={{ opacity: 0, y: 5 }}
                               animate={{ opacity: 1, y: 0 }}
                               exit={{ opacity: 0, y: 5 }}
                               transition={{ duration: 0.15 }}
                               className="absolute z-20 w-full top-[105%] bg-white border border-black/5 shadow-2xl rounded-2xl overflow-hidden py-2"
                             >
                               {branches.map((branch) => (
                                 <button
                                   key={branch.id}
                                   type="button"
                                   onClick={() => {
                                     setSelectedBranch(branch.id);
                                     setIsDropdownOpen(false);
                                   }}
                                   className={`w-full text-left px-5 py-3 text-sm transition-colors font-medium ${
                                     selectedBranch === branch.id 
                                       ? 'bg-primary/5 text-primary font-bold' 
                                       : 'text-ink/70 hover:bg-[#FAFAFA] hover:text-ink'
                                   }`}
                                 >
                                   {t(`branches.${branch.key}`)}
                                 </button>
                               ))}
                             </motion.div>
                           )}
                         </AnimatePresence>
                       </div>

                       {/* ID Upload */}
                       <div className="flex flex-col gap-1.5 w-full">
                         <label className="text-[10px] font-bold text-ink/60 uppercase tracking-widest pl-1">
                           {t('idPhotoLabel')}
                         </label>
                         <div className="relative flex items-center justify-between bg-black/[0.03] hover:bg-black/[0.05] rounded-2xl px-5 py-3 transition-all duration-300">
                           <span className="text-sm text-ink/40 font-medium truncate max-w-[200px]">
                             {selectedFile ? <span className="text-ink font-semibold">{selectedFile.name}</span> : 'Max 5MB (Secure)'}
                           </span>
                           <input 
                             type="file" 
                             accept="image/*" 
                             className="hidden" 
                             ref={fileInputRef}
                             onChange={(e) => {
                               if (e.target.files && e.target.files.length > 0) {
                                 setSelectedFile(e.target.files[0]);
                               }
                             }}
                           />
                           <button 
                             type="button" 
                             onClick={() => fileInputRef.current?.click()}
                             className="bg-white border border-black/5 shadow-sm text-ink hover:text-primary hover:border-primary/30 transition-all rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2"
                           >
                             <Upload className="w-3.5 h-3.5" /> 
                             {t('uploadButton')}
                           </button>
                         </div>
                       </div>
                     </div>

                     <div className="mt-2">
                       <FluidButton disabled={isLoading} type="submit" text={isLoading ? "Submitting..." : t('submitButton')} className="w-full min-w-full" variant="dark" />
                     </div>
                   </motion.form>
                 ) : (
                   <motion.div
                     key="success"
                     initial={{ opacity: 0, scale: 0.95 }}
                     animate={{ opacity: 1, scale: 1 }}
                     className="flex flex-col items-center justify-center text-center py-16 relative z-10"
                   >
                     <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                       <CheckCircle2 className="w-10 h-10 text-primary" />
                     </div>
                     <h3 className="text-2xl md:text-3xl font-black font-heading text-ink uppercase tracking-tighter mb-4">
                       {t('successTitle')}
                     </h3>
                     <p className="text-ink/60 text-sm leading-relaxed mb-8 max-w-sm font-medium">
                       {t('successText')}
                     </p>
                     <button
                       onClick={() => setIsSubmitted(false)}
                       className="text-xs font-bold uppercase tracking-widest text-ink/40 hover:text-primary transition-colors border-b border-ink/20 hover:border-primary pb-1"
                     >
                       {t('submitAnother')}
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
             </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
