export type FaqItemType = {
  question: string;
  answer: string;
};

export type FaqCategoryType = {
  category: string;
  items: FaqItemType[];
};

export const faqData: FaqCategoryType[] = [
  {
    "category": "GENERAL PEPTIDE EDUCATION",
    "items": [
      {
        "question": "What is a research peptide?",
        "answer": "A research peptide is a short chain of amino acids, usually under 50 residues, manufactured for laboratory study and not for human or veterinary use. The distinction sits in the documentation, not the molecule. The same sequence made for research carries a batch-specific certificate of analysis, and the research-use-only designation applies from synthesis through to the vial label. Helix Bio Chem supplies its entire catalog on that basis."
      },
      {
        "question": "What are research peptides used for in laboratory research?",
        "answer": "They work as standardized reagents. A study running over months needs the same compound at the same documented purity in week one and week ten, and the certificate of analysis for each lot is the record showing the material matched. Typical settings include receptor-binding assays, cell-culture work, and preclinical animal models where batch-to-batch consistency determines whether results can be compared at all."
      },
      {
        "question": "How are research peptides classified for human use?",
        "answer": "They are not classified for human use at all. Every compound in the Helix Bio Chem catalog carries Research Use Only labeling, meaning it has not been evaluated or approved by the FDA for human or veterinary use, and it is not formulated, packaged, or sold for administration by any route. The designation describes what the material is for, and it holds from the product page to the vial label."
      },
      {
        "question": "What quality standards does Helix Bio Chem apply to research peptides?",
        "answer": "Every batch is tested before it is listed. HPLC measures purity, mass spectrometry confirms molecular identity and weight, and both results are recorded on a certificate of analysis carrying that lot's number. Matching the lot number on the certificate to the number printed on the vial is what ties the document to the material actually in hand."
      },
      {
        "question": "Who typically purchases research peptides from Helix Bio Chem?",
        "answer": "Academic laboratories, private research organizations, and institutional researchers make up the catalog's buyer base. Orders are placed on the understanding that materials are supplied for laboratory research only. Purchasers handle the material under their own institutional procedures and remain responsible for any regulatory obligations that apply in their jurisdiction."
      }
    ]
  },
  {
    "category": "LEGALITY & COMPLIANCE",
    "items": [
      {
        "question": "Are research peptides legal to purchase in the USA?",
        "answer": "Research chemicals sold and labeled for laboratory use are generally available for purchase in the United States, and the research-use-only designation is what keeps them outside the drug approval pathway. That designation only holds while it is accurate. If material labeled RUO is marketed or used for human administration, the label no longer describes what is happening, and the FDA has acted on exactly that distinction. Buyers remain responsible for compliance within their own institution."
      },
      {
        "question": "What makes a peptide \"research use only\"?",
        "answer": "A peptide is designated research use only when it is manufactured, labeled, and sold exclusively for scientific study. It is not intended for diagnostic, therapeutic, or human-consumption purposes, and it has not been evaluated by the FDA for those other uses."
      },
      {
        "question": "How are research peptides regulated?",
        "answer": "Research-use-only peptides sit outside the FDA's drug approval pathway because they are not marketed for human use. They are handled as laboratory reagents, subject to general chemical handling and shipping requirements. That position depends entirely on intended use. A compound marketed or sold for human administration is treated as an unapproved drug whatever its label says, and the FDA has issued warning letters on that basis."
      },
      {
        "question": "Are research peptides evaluated or approved by the FDA?",
        "answer": "No. Compounds sold as research use only have not been evaluated or approved by the FDA for any human or veterinary use. FDA evaluation applies to approved drugs and medical products, not to research-only laboratory materials."
      },
      {
        "question": "Can research peptides be used outside a laboratory research setting?",
        "answer": "No. Research peptides sold research use only are intended exclusively for controlled laboratory environments. They are not approved for human use, veterinary use, or any application outside of scientific research."
      }
    ]
  },
  {
    "category": "QUALITY & ANALYTICAL TESTING",
    "items": [
      {
        "question": "What is a certificate of analysis (COA)?",
        "answer": "A COA is a batch-specific document reporting a peptide's measured purity (via HPLC), confirmed molecular weight (via mass spectrometry), and testing date. It lets a researcher verify a vial's specifications independently, without taking a label on faith."
      },
      {
        "question": "How do I verify peptide purity through analytical testing?",
        "answer": "Purity is verified by high-performance liquid chromatography (HPLC), which separates the target compound from related impurities and reports a purity percentage. Mass spectrometry is used alongside it to confirm the compound's identity and molecular weight."
      },
      {
        "question": "What purity level should a research peptide meet?",
        "answer": "Research-grade peptides are commonly reported at 98% or higher. Helix Bio Chem's standard is 99% or above, measured by HPLC. The figure matters less than where it came from: a purity percentage should come from a batch test documented on a certificate of analysis, with the lot number matching the vial and the detection wavelength stated. A purity figure read at the wrong wavelength can say very little about what is in the vial."
      },
      {
        "question": "How can I verify a peptide's purity independently?",
        "answer": "Request the batch-specific certificate of analysis and match its lot number to the vial received. Researchers with in-house or third-party lab access can also run their own HPLC or mass spectrometry confirmation."
      },
      {
        "question": "Is third-party testing available for Helix Bio Chem peptides?",
        "answer": "Yes. Every batch is analyzed by an independent laboratory, and those results appear on the lot's certificate of analysis. Independent testing means the figure on the certificate was not produced by the party selling the material, which is the point of publishing it."
      }
    ]
  },
  {
    "category": "SUPPLIER & ORDERING QUESTIONS",
    "items": [
      {
        "question": "How do I choose a reliable peptide supplier?",
        "answer": "Look for a supplier that tests every batch, publishes the certificate of analysis before purchase, states a purity threshold and stands behind it, and keeps research-use labeling plainly visible on the product page and at checkout. Before ordering, ask directly whether every batch is tested, whether the certificate is available in advance, and how orders are packed and stored in transit. A supplier that answers plainly and documents its process is easier to evaluate than one advertising a number with nothing behind it."
      },
      {
        "question": "What documentation should be included with a peptide order?",
        "answer": "At minimum, an order should include an invoice and access to the batch-specific certificate of analysis. Institutional buyers can request additional documentation, such as consolidated invoicing, through a wholesale account."
      },
      {
        "question": "Do you offer any product bundles or discounts?",
        "answer": "Current promotions, bundles, and discount programs are listed on the shop page; the FAQ does not duplicate them, since availability changes with inventory. Check the shop or subscribe to the mailing list for updates."
      },
      {
        "question": "Does Helix Bio Chem ship research peptide orders nationwide in the USA?",
        "answer": "Yes. Helix Bio Chem ships research peptide orders across the United States. All shipments are handled using controlled packaging practices to help preserve compound stability in transit."
      }
    ]
  },
  {
    "category": "STORAGE & HANDLING",
    "items": [
      {
        "question": "How should I store lyophilized peptides?",
        "answer": "Unreconstituted, lyophilized peptides are generally stored frozen or refrigerated, protected from light and moisture, until needed for a study. Storage guidance specific to a compound is included on its product page."
      },
      {
        "question": "Why is temperature control important for peptide stability?",
        "answer": "Heat exposure and repeated freeze-thaw cycles can degrade a peptide's structure and reduce its usable purity over time. Consistent, appropriate temperature control preserves the integrity confirmed on the certificate of analysis."
      },
      {
        "question": "What is cold-chain handling?",
        "answer": "Cold-chain handling means a compound is kept within a controlled temperature range from shipment through delivery, using insulated packaging and, where needed, cold packs, so stability isn't compromised in transit."
      },
      {
        "question": "How is peptide concentration expressed after reconstitution?",
        "answer": "Concentration is mass divided by volume, expressed as mg/mL. A lyophilized peptide has a known mass stated on its certificate of analysis, and once a diluent is added, dividing that mass by the volume gives the concentration of the resulting solution. The arithmetic is the same for any peptide. What volume to use, and what concentration a given experiment calls for, is set by the researcher's own institutional protocol. Helix Bio Chem does not provide reconstitution volumes, administration guidance, or usage instructions for any compound in the catalog."
      }
    ]
  },
  {
    "category": "TIRZEPATIDE",
    "items": [
      {
        "question": "What is Tirzepatide?",
        "answer": "Tirzepatide is a synthetic peptide studied as a dual GIP/GLP-1 receptor agonist in metabolic and incretin-pathway research. Helix Bio Chem's Tirzepatide is sold strictly as a research compound."
      },
      {
        "question": "What research models is Tirzepatide commonly studied in?",
        "answer": "Tirzepatide is referenced in preclinical and in vitro research literature examining incretin receptor signaling and metabolic pathways, consistent with its classification as a research-use-only compound in this catalog."
      },
      {
        "question": "Is Tirzepatide intended for human use or sale for consumption?",
        "answer": "No. Tirzepatide is sold exclusively for laboratory research and is not intended, labeled, or approved for human or veterinary consumption in any form."
      },
      {
        "question": "Are dosing or administration instructions provided for Tirzepatide?",
        "answer": "No. Helix Bio Chem does not provide dosing, administration, or usage guidance for Tirzepatide or any other compound in the catalog."
      },
      {
        "question": "Has Tirzepatide been evaluated by the FDA?",
        "answer": "No. Tirzepatide has not been evaluated or approved by the FDA for any human or veterinary use."
      }
    ]
  },
  {
    "category": "SURVODUTIDE",
    "items": [
      {
        "question": "What is Survodutide studied for in research?",
        "answer": "Survodutide is a synthetic peptide studied as a dual glucagon/GLP-1 receptor agonist, primarily in metabolic-pathway research examining energy balance and receptor signaling."
      },
      {
        "question": "Is Survodutide a therapeutic product?",
        "answer": "No. Helix Bio Chem positions Survodutide exclusively as a research compound, not as a medical treatment or consumer health product."
      },
      {
        "question": "How is Survodutide classified for research purposes?",
        "answer": "It is classified and sold as a research-use-only peptide, intended for laboratory study of dual-receptor agonist activity, not for any clinical or consumer application."
      },
      {
        "question": "Are purity levels specified for Survodutide?",
        "answer": "Yes. Each batch is tested and its purity percentage is published on the corresponding certificate of analysis, available before ordering."
      },
      {
        "question": "Is Survodutide intended for diagnostic or treatment purposes?",
        "answer": "No. Survodutide is not intended, labeled, or approved for diagnostic or therapeutic use in humans or animals."
      }
    ]
  },
  {
    "category": "SLU-PP-332",
    "items": [
      {
        "question": "What type of compound is SLU-PP-332?",
        "answer": "SLU-PP-332 is a synthetic small-molecule compound studied as a pan-agonist of the estrogen-related receptors (ERRs), an area of interest in exercise-mimetic and metabolic research."
      },
      {
        "question": "What research models have examined SLU-PP-332?",
        "answer": "Published research on SLU-PP-332 has largely been preclinical, examining its effect on ERR-pathway signaling in cellular and animal models, not in human clinical trials."
      },
      {
        "question": "Is SLU-PP-332 cleared for any use outside research?",
        "answer": "No. SLU-PP-332 is not evaluated or approved for any use outside of laboratory research, and Helix Bio Chem sells it strictly on that basis."
      },
      {
        "question": "Is regulatory approval claimed for SLU-PP-332?",
        "answer": "No regulatory approval is claimed. It has not been evaluated by the FDA for safety or efficacy in any human-use context."
      }
    ]
  },
  {
    "category": "SEMAGLUTIDE",
    "items": [
      {
        "question": "Why is Semaglutide used in research?",
        "answer": "Semaglutide is a well-characterized GLP-1 receptor agonist, making it a frequent reference compound in metabolic and incretin-pathway research literature."
      },
      {
        "question": "Is Semaglutide a widely referenced compound in research literature?",
        "answer": "Yes. Semaglutide is one of the most extensively studied GLP-1 receptor agonists in published research, which is part of why it remains a common research-peptide request."
      },
      {
        "question": "Is Semaglutide sold research use only?",
        "answer": "Yes. Helix Bio Chem's Semaglutide is labeled and sold strictly research use only, and is not intended for human or veterinary consumption."
      },
      {
        "question": "Is clinical or dosing guidance provided?",
        "answer": "No. Helix Bio Chem does not provide dosing, administration, or clinical guidance for Semaglutide or any other compound in the catalog."
      },
      {
        "question": "Has Semaglutide been evaluated by the FDA in this research context?",
        "answer": "No. The Semaglutide sold in Helix Bio Chem's research catalog has not been evaluated or approved by the FDA for any human or veterinary use."
      }
    ]
  },
  {
    "category": "RETATRUTIDE",
    "items": [
      {
        "question": "What is Retatrutide studied for in research?",
        "answer": "Retatrutide is a synthetic peptide studied as a triple hormone receptor agonist (GIP, GLP-1, and glucagon), an area of active interest in metabolic research."
      },
      {
        "question": "Is Retatrutide used in human clinical research by Helix Bio Chem?",
        "answer": "No. Helix Bio Chem's Retatrutide is a research-use-only compound unrelated to any clinical trial supply chain, and is not distributed for clinical or human-use research."
      },
      {
        "question": "Are dosing protocols provided?",
        "answer": "No. Consistent with its research-use-only labeling, Retatrutide is sold without dosing or administration instructions intended for human use."
      },
      {
        "question": "Is a specific purity percentage guaranteed?",
        "answer": "Each batch is tested and its purity reported on that lot's certificate of analysis. The figure belongs to the batch, so it is published per lot and not fixed as a single catalog-wide number."
      },
      {
        "question": "Is Retatrutide intended for animal use?",
        "answer": "No. Retatrutide is sold strictly for laboratory research and is not intended, labeled, or approved for animal or veterinary use."
      }
    ]
  },
  {
    "category": "MOTS-C",
    "items": [
      {
        "question": "What type of peptide is MOTS-C?",
        "answer": "MOTS-C is a mitochondrial-derived peptide studied for its role in metabolic signaling and cellular energy regulation in preclinical research."
      },
      {
        "question": "What research areas include MOTS-C?",
        "answer": "MOTS-C appears in research literature spanning metabolic regulation, exercise physiology, and mitochondrial function studies, primarily in cellular and animal models."
      },
      {
        "question": "Can research outcomes be predicted from MOTS-C studies?",
        "answer": "No. Individual study outcomes cannot be predicted or guaranteed from existing literature; each research use requires its own protocol and analysis."
      },
      {
        "question": "Is MOTS-C a dietary supplement?",
        "answer": "No. MOTS-C is not a supplement or consumable product; it is sold strictly for laboratory research."
      },
      {
        "question": "Is analytical testing performed on MOTS-C?",
        "answer": "Yes. Each batch is tested for purity and identity, with results available on the certificate of analysis."
      }
    ]
  },
  {
    "category": "EPITALON",
    "items": [
      {
        "question": "What is Epitalon's research focus?",
        "answer": "Epitalon is a synthetic tetrapeptide studied primarily in longevity and cellular-aging research, including work related to telomerase activity."
      },
      {
        "question": "Is Epitalon a pharmaceutical product?",
        "answer": "No. Epitalon is offered for research purposes only and does not carry any medical, therapeutic, or treatment claim."
      },
      {
        "question": "Is Epitalon intended for longevity treatment in humans?",
        "answer": "No. Epitalon is not intended, labeled, or approved as a human longevity treatment; it is sold strictly for laboratory research into aging-related biology."
      },
      {
        "question": "Is a specific purity guaranteed?",
        "answer": "Purity is confirmed per batch and published on the certificate of analysis, not fixed as a blanket guarantee across all lots."
      },
      {
        "question": "Are medical or anti-aging claims made for Epitalon?",
        "answer": "No. Helix Bio Chem does not make medical, therapeutic, or anti-aging claims for Epitalon; it is referenced in research literature only."
      }
    ]
  },
  {
    "category": "AOD-9604",
    "items": [
      {
        "question": "What is AOD-9604 studied for in research?",
        "answer": "AOD-9604 is a synthetic analogue of the C-terminal fragment of human growth hormone, residues 176 to 191, carrying an added tyrosine at the N-terminus. That single change is what separates it from the native fragment, and the two carry different registry numbers and different bodies of published research. AOD-9604 appears in metabolic research literature examining lipid-metabolism signaling, mostly in cellular and animal models."
      },
      {
        "question": "What research frameworks or models include AOD-9604?",
        "answer": "AOD-9604 appears in preclinical literature examining fat-metabolism signaling, typically in cellular and animal-model research, not human clinical studies."
      },
      {
        "question": "Is AOD-9604 intended for human or veterinary use?",
        "answer": "No. AOD-9604 is sold strictly for laboratory research and is not intended for human or veterinary use."
      },
      {
        "question": "Is dosing guidance provided for AOD-9604?",
        "answer": "No. Helix Bio Chem does not provide dosing or administration guidance for AOD-9604."
      },
      {
        "question": "Has AOD-9604 been evaluated by the FDA?",
        "answer": "No. It has not been evaluated or approved by the FDA."
      }
    ]
  },
  {
    "category": "5-AMINO-1MQ",
    "items": [
      {
        "question": "What type of compound is 5-Amino-1MQ?",
        "answer": "5-Amino-1MQ is a small molecule, not a peptide, studied as an inhibitor of nicotinamide N-methyltransferase (NNMT) in metabolic research. It is listed alongside peptides in this catalog for convenience, though structurally it belongs to a different class entirely."
      },
      {
        "question": "Is 5-Amino-1MQ a synthesized research compound?",
        "answer": "Yes. It is a synthesized small molecule manufactured and tested for laboratory research use, not derived from or intended as a dietary ingredient."
      },
      {
        "question": "Is 5-Amino-1MQ intended for ingestion or dietary use?",
        "answer": "No. It is not derived from or intended as a dietary ingredient, and it is not intended for ingestion or consumption."
      },
      {
        "question": "Are purity levels consistent across batches of 5-Amino-1MQ?",
        "answer": "Purity is verified per batch and may vary slightly from lot to lot; current figures are published on the certificate of analysis."
      },
      {
        "question": "Is 5-Amino-1MQ evaluated by the FDA?",
        "answer": "No. It has not been evaluated or approved by the FDA for any use."
      }
    ]
  },
  {
    "category": "SEMAX / SELANK BLEND",
    "items": [
      {
        "question": "Why are Semax and Selank combined in one product?",
        "answer": "Semax and Selank are both synthetic neuropeptides frequently studied together in neuropeptide research, so the blend is offered as a convenience for researchers examining both compounds in the same protocol."
      },
      {
        "question": "Is this blend a clinical formulation?",
        "answer": "No. The Semax/Selank blend is a research-use-only combination product, not a clinical formulation intended for human administration."
      },
      {
        "question": "Is clinical testing provided for the blend?",
        "answer": "No. Helix Bio Chem does not conduct or reference clinical testing for this blend; documentation is limited to batch purity and identity testing appropriate to a research compound."
      },
      {
        "question": "Is regulatory approval claimed?",
        "answer": "No. No regulatory approval is claimed for this blend, and it has not been evaluated by the FDA for any human-use context."
      },
      {
        "question": "Is the Semax/Selank blend intended for human use?",
        "answer": "No. This blend is sold strictly for laboratory research and is not intended, labeled, or approved for human administration."
      }
    ]
  },
  {
    "category": "SEMAX",
    "items": [
      {
        "question": "What research focus does Semax have?",
        "answer": "Semax is a synthetic peptide derived from an ACTH fragment, studied in neuropeptide research related to cognitive and neurological signaling pathways."
      },
      {
        "question": "Is Semax sold for research use only?",
        "answer": "Yes. Semax is labeled and sold research use only, with purity confirmed per batch on its certificate of analysis."
      },
      {
        "question": "Is dosing guidance or a clinical framework claimed?",
        "answer": "No. Helix Bio Chem does not provide dosing guidance or reference any clinical framework for Semax; it is sold strictly as a research reagent."
      },
      {
        "question": "Is Semax approved for any route of human administration?",
        "answer": "No. Semax is not approved for nasal, injectable, or any other route of human administration."
      },
      {
        "question": "Is Semax evaluated by the FDA?",
        "answer": "No. Semax has not been evaluated or approved by the FDA."
      }
    ]
  },
  {
    "category": "SELANK",
    "items": [
      {
        "question": "What is Selank used for in research?",
        "answer": "Selank is a synthetic peptide analog studied in neuropeptide research, with published literature examining its interaction with stress- and anxiety-related signaling pathways in animal models."
      },
      {
        "question": "Is a specific effect claimed for Selank?",
        "answer": "No. Helix Bio Chem does not make effect or outcome claims for Selank; findings referenced in research literature are not a guarantee of any particular result."
      },
      {
        "question": "Is guidance provided for experimental use?",
        "answer": "No. Helix Bio Chem does not provide experimental-use or dosing guidance for Selank; researchers are expected to design their own protocols appropriate to their institution."
      },
      {
        "question": "Is Selank a therapeutic or consumer product?",
        "answer": "No. Selank is sold strictly as a research peptide and is not a therapeutic or consumer product."
      },
      {
        "question": "Is Selank evaluated by the FDA?",
        "answer": "No. It has not been evaluated or approved by the FDA."
      }
    ]
  },
  {
    "category": "DSIP",
    "items": [
      {
        "question": "What research does DSIP support?",
        "answer": "DSIP (delta sleep-inducing peptide) is studied in sleep-cycle and neuropeptide research examining its association with sleep-related signaling in preclinical models."
      },
      {
        "question": "Is DSIP marketed as a sleep aid?",
        "answer": "No. DSIP is sold strictly as a research compound and is not marketed, labeled, or intended as a consumer sleep aid."
      },
      {
        "question": "Is DSIP approved for clinical use?",
        "answer": "No. DSIP is not evaluated or approved by the FDA for clinical use in humans."
      },
      {
        "question": "Are sleep benefits guaranteed for DSIP research?",
        "answer": "No. Helix Bio Chem does not claim or guarantee any sleep-related benefit for DSIP."
      },
      {
        "question": "Is administration guidance included with DSIP?",
        "answer": "No. Helix Bio Chem does not provide administration or dosing guidance for DSIP."
      }
    ]
  },
  {
    "category": "TB-500",
    "items": [
      {
        "question": "What is TB-500 associated with in research?",
        "answer": "TB-500 is a product designation, not a chemical name. Analytical literature associates material sold under that name with an N-terminal acetylated fragment spanning the actin-binding region of thymosin beta-4, and published analysis of internet-sourced TB-500 has found contents that do not consistently match their descriptions. What any given vial contains is settled by its certificate of analysis. TB-500 appears in research literature on tissue repair and cellular migration."
      },
      {
        "question": "What research models use TB-500?",
        "answer": "TB-500 appears in preclinical and in vitro research examining tissue-repair mechanisms, typically in cellular and animal-model studies, not human trials."
      },
      {
        "question": "Is TB-500 provided for treatment purposes?",
        "answer": "No. TB-500 is sold strictly for laboratory research and is not provided, labeled, or intended for treatment of any condition in humans or animals."
      },
      {
        "question": "Is TB-500 approved for veterinary use?",
        "answer": "No. TB-500 is not evaluated or approved for veterinary or human use of any kind."
      },
      {
        "question": "Are purity claims fixed across every TB-500 batch?",
        "answer": "No. Purity is verified per batch and reported on the corresponding certificate of analysis, not fixed across all lots."
      }
    ]
  },
  {
    "category": "BPC-157",
    "items": [
      {
        "question": "What type of peptide is BPC-157?",
        "answer": "BPC-157 is a synthetic pentadecapeptide with the sequence GEPPPGKPADDAGLV, corresponding to a partial sequence of a protein identified in gastric juice. It is synthesized, not extracted, which is why describing it as naturally occurring overstates the case. It appears in preclinical research on tissue repair and gastroprotective mechanisms."
      },
      {
        "question": "What research models study BPC-157?",
        "answer": "BPC-157 is referenced across preclinical literature covering tissue-repair and gastrointestinal research, primarily in cellular and animal-model studies."
      },
      {
        "question": "Is BPC-157 intended for healing or injury treatment?",
        "answer": "No. BPC-157 is sold strictly for laboratory research and is not intended for the treatment of any injury or condition."
      },
      {
        "question": "Is clinical data provided for BPC-157?",
        "answer": "No. Helix Bio Chem does not provide or reference clinical data for BPC-157; documentation is limited to batch purity and identity testing."
      },
      {
        "question": "Is FDA approval claimed for BPC-157?",
        "answer": "No. No regulatory approval is claimed for BPC-157."
      }
    ]
  },
  {
    "category": "TB-500 / BPC-157",
    "items": [
      {
        "question": "Why are TB-500 and BPC-157 offered together?",
        "answer": "Both compounds are frequently studied together in tissue-repair research literature, so the combination is offered as a convenience for researchers examining both in a single protocol."
      },
      {
        "question": "Is this a combination product with claimed effects?",
        "answer": "No. Helix Bio Chem does not make combined-effect claims for this product; it is sold strictly as two research-use-only compounds packaged together."
      },
      {
        "question": "Is a specific research use claimed for the combination?",
        "answer": "No specific outcome is claimed. The combination is offered for laboratory research consistent with the individual research use of each compound."
      },
      {
        "question": "Is human use permitted for the TB-500/BPC-157 combination?",
        "answer": "No. This combination is sold strictly for laboratory research, and human use is not permitted."
      },
      {
        "question": "Are experimental protocols supplied with this combination?",
        "answer": "No. Helix Bio Chem does not supply experimental protocols; researchers design their own studies appropriate to their institution."
      }
    ]
  },
  {
    "category": "KLOW",
    "items": [
      {
        "question": "What is KLOW?",
        "answer": "KLOW is a multi-compound research blend. The name is a product designation, and published specifications for blends carrying it do not agree across suppliers. Composition and per-compound content for any given lot are settled by the current product page and that lot's certificate of analysis."
      },
      {
        "question": "What research models is KLOW used for?",
        "answer": "KLOW is positioned for researchers studying multiple compounds together in skin-biology and recovery-adjacent research contexts, consistent with the individual compounds it combines."
      },
      {
        "question": "Is the composition of KLOW disclosed?",
        "answer": "Yes. Composition and per-compound content are disclosed on the product page and supporting documentation, and should be reviewed before ordering."
      },
      {
        "question": "Is KLOW a medical product?",
        "answer": "No. KLOW is sold strictly for laboratory research and is not a medical or pharmaceutical product for human use."
      },
      {
        "question": "Is usage guidance provided?",
        "answer": "No. Helix Bio Chem does not provide dosing, administration, or human-use guidance for KLOW or any other compound in the catalog."
      }
    ]
  },
  {
    "category": "GLOW",
    "items": [
      {
        "question": "What research focus does GLOW have?",
        "answer": "GLOW is a multi-compound research blend positioned around skin-biology research, combining compounds already covered individually elsewhere in this FAQ (such as GHK-Cu)."
      },
      {
        "question": "Is GLOW a cosmetic product?",
        "answer": "No. GLOW is sold strictly for laboratory research and is not marketed, labeled, or intended as a cosmetic or consumer skincare product."
      },
      {
        "question": "Are aesthetic outcomes implied?",
        "answer": "No. Helix Bio Chem does not make aesthetic or outcome claims for GLOW; any research findings referenced in literature are not a guarantee of a particular result."
      },
      {
        "question": "Is it FDA-approved?",
        "answer": "No. GLOW is not evaluated or approved by the FDA, and no regulatory-approval claim is made for it."
      },
      {
        "question": "Is usage or application guidance provided for GLOW?",
        "answer": "No. Helix Bio Chem does not provide dosing, application, or human-use guidance for GLOW."
      }
    ]
  },
  {
    "category": "GLUTATHIONE",
    "items": [
      {
        "question": "What is glutathione studied for?",
        "answer": "Glutathione is a naturally occurring antioxidant tripeptide, widely studied in research on oxidative stress and cellular defense mechanisms."
      },
      {
        "question": "Is this product a dietary supplement?",
        "answer": "No. Although glutathione is available in some consumer supplement forms elsewhere, Helix Bio Chem's glutathione is sold strictly for laboratory research and is not offered as a dietary supplement."
      },
      {
        "question": "Is an antioxidant benefit claimed?",
        "answer": "Helix Bio Chem references glutathione's documented role in antioxidant research literature but does not make a personal-benefit or outcome claim for its product."
      },
      {
        "question": "Is ingestion allowed?",
        "answer": "No. Helix Bio Chem's glutathione is not intended for ingestion or human consumption in any form; it is sold research use only."
      },
      {
        "question": "Is analytical testing performed?",
        "answer": "Yes. Each batch is tested for purity and identity, with results available on the certificate of analysis before ordering."
      }
    ]
  },
  {
    "category": "METABOLIC & INCRETIN RESEARCH",
    "items": [
      {
        "question": "What are these peptides researched for?",
        "answer": "This category covers compounds studied in metabolic and incretin-pathway research, including receptor agonists examined for their role in energy balance and glucose regulation in preclinical models."
      },
      {
        "question": "Which signaling pathways are commonly studied in this category?",
        "answer": "Commonly studied pathways include GLP-1, GIP, and glucagon receptor signaling, along with downstream metabolic and energy-balance mechanisms."
      },
      {
        "question": "Are these compounds intended for clinical use?",
        "answer": "No. Every compound in this category is sold research use only and is not intended, labeled, or approved for clinical or human-use application."
      },
      {
        "question": "Do these products support in vitro and in vivo research models?",
        "answer": "Yes. Published literature on this category spans both in vitro (cellular) and in vivo (animal-model) research, consistent with standard preclinical study design."
      },
      {
        "question": "Who typically researches compounds in this category?",
        "answer": "Academic, private, and institutional researchers studying metabolic and incretin-pathway signaling use compounds in this category as standardized reference reagents."
      }
    ]
  },
  {
    "category": "COGNITIVE FUNCTION RESEARCH",
    "items": [
      {
        "question": "What is the focus of cognitive function research on peptides?",
        "answer": "This category focuses on neuropeptides studied for their interaction with cognitive and neurological signaling pathways in preclinical research."
      },
      {
        "question": "Which neurological systems are commonly studied in this category?",
        "answer": "Research in this category commonly examines stress-response, neurotransmitter, and neuroprotective signaling systems, depending on the specific compound."
      },
      {
        "question": "Are these compounds tested for cognitive-relevant endpoints?",
        "answer": "Published research on these compounds includes cognitive- and behavior-relevant endpoints in animal models; Helix Bio Chem does not conduct or claim its own cognitive testing."
      },
      {
        "question": "Which peptides are commonly used in cognitive research?",
        "answer": "Semax and Selank are the two compounds most commonly referenced in this category, both covered individually earlier in this FAQ."
      },
      {
        "question": "Are any of these compounds intended for therapeutic or psychoactive use?",
        "answer": "No. Every compound in this category is sold research use only and is not intended for therapeutic, psychoactive, or human-use application."
      }
    ]
  },
  {
    "category": "SLEEP CYCLE INVESTIGATION",
    "items": [
      {
        "question": "What role does sleep-cycle research play in peptide studies?",
        "answer": "This category covers compounds studied for their association with sleep-related biological signaling, distinct from any consumer sleep-aid application."
      },
      {
        "question": "Which biological processes are commonly researched for sleep?",
        "answer": "Research in this category commonly examines neuropeptide signaling tied to sleep-wake regulation in preclinical, primarily animal-model, studies."
      },
      {
        "question": "Are these compounds endogenous or synthetic?",
        "answer": "DSIP, the primary compound in this category, is modeled on an endogenously occurring peptide but is manufactured synthetically for research use."
      },
      {
        "question": "Which peptides are typically used in sleep-cycle peptide research?",
        "answer": "DSIP is the compound most closely associated with sleep-cycle research in this catalog, covered individually earlier in this FAQ."
      },
      {
        "question": "Are these compounds marketed as consumer sleep aids?",
        "answer": "No. Compounds in this category are sold strictly for laboratory research and are not marketed or labeled as consumer sleep aids."
      }
    ]
  },
  {
    "category": "RECOVERY RESEARCH PEPTIDES",
    "items": [
      {
        "question": "What is the focus of recovery research peptides?",
        "answer": "This category covers compounds studied in tissue-repair and cellular-recovery research, including peptides examined for their role in wound-healing and regenerative signaling pathways."
      },
      {
        "question": "What types of tissue are commonly studied in this category?",
        "answer": "Published research spans soft-tissue, tendon, and gastrointestinal tissue models, depending on the specific compound and study design."
      },
      {
        "question": "Why are peptide combinations used in this category?",
        "answer": "Some compounds in this category, such as TB-500 and BPC-157, are frequently studied together because their research literature covers overlapping tissue-repair mechanisms."
      },
      {
        "question": "Are these products regenerative treatments?",
        "answer": "No. These are research-use-only compounds studied in regenerative biology, not regenerative treatments approved or intended for human or veterinary use."
      },
      {
        "question": "Who typically studies recovery research peptides?",
        "answer": "Researchers examining tissue-repair biology, cellular signaling, and regenerative mechanisms use compounds in this category as standardized research reagents."
      }
    ]
  },
  {
    "category": "ANTIOXIDANT & CELLULAR DEFENSE RESEARCH",
    "items": [
      {
        "question": "What is the goal of cellular defense research compounds?",
        "answer": "This category covers compounds studied for their role in oxidative-stress response and cellular-defense signaling, such as glutathione and GHK-Cu."
      },
      {
        "question": "Which pathways are commonly researched in this category?",
        "answer": "Commonly studied pathways include antioxidant enzyme signaling and cellular-repair mechanisms tied to oxidative stress."
      },
      {
        "question": "Are these compounds tested for antioxidant capacity?",
        "answer": "Published literature on these compounds includes antioxidant-capacity testing in laboratory settings; Helix Bio Chem references that literature without making its own outcome claims."
      },
      {
        "question": "Are these compounds typically studied in combination with other research compounds?",
        "answer": "Yes. Compounds in this category, such as GHK-Cu, are sometimes studied alongside other research peptides, including within blends like GLOW covered earlier in this FAQ."
      },
      {
        "question": "Are these compounds intended for human antioxidant supplementation?",
        "answer": "No. Compounds in this category are sold research use only and are not intended for human dietary or supplemental use."
      }
    ]
  },
  {
    "category": "GHK-CU PEPTIDE RESEARCH",
    "items": [
      {
        "question": "What is GHK-Cu?",
        "answer": "GHK-Cu is a copper(II) complex of the tripeptide glycyl-L-histidyl-L-lysine, a sequence that occurs naturally in human plasma. The peptide binds copper with high affinity, and the resulting complex is what research refers to as GHK-Cu. It is also listed under the INCI name copper tripeptide-1 in cosmetic contexts, where it describes the same molecule in a different regulatory setting. Helix Bio Chem supplies it as a research material for laboratory use only."
      },
      {
        "question": "What is GHK-Cu's proposed mechanism in research models?",
        "answer": "Published work associates GHK-Cu with copper transport and with signaling in fibroblasts and extracellular matrix turnover. The copper component acts as a cofactor for enzymes including lysyl oxidase, which participates in collagen cross-linking. Studies have examined its relationship to collagen and elastin expression and to gene expression patterns in cultured cells. These are model observations, and what a cell culture reports does not transfer directly to any other setting."
      },
      {
        "question": "What research applications is GHK-Cu used in?",
        "answer": "GHK-Cu appears in cell-culture and tissue-model research covering extracellular matrix biology, fibroblast and keratinocyte behavior, wound-healing models, barrier-recovery models, dermal papilla cell cultures, and copper-dependent signaling. Endpoints reported in these settings belong to the specific models that produced them. Helix Bio Chem supplies the compound for laboratory investigation and makes no claim about outcomes in any other context."
      },
      {
        "question": "How is GHK-Cu purity and identity verified?",
        "answer": "GHK-Cu is verified two ways. HPLC measures purity by separating the target compound from related impurities, and mass spectrometry confirms molecular identity and weight. Because GHK-Cu is a metal complex, not a plain peptide, the copper coordination is part of what defines the material, and a complete impurity profile accounts for uncomplexed free GHK and excess copper salts alongside truncated sequences. The certificate of analysis for each lot is the record of what that lot contains."
      },
      {
        "question": "Is GHK-Cu approved for cosmetic, medical, or human use?",
        "answer": "No. GHK-Cu sold by Helix Bio Chem is a research material and is not approved, labeled, or intended for cosmetic, medical, veterinary, or human use of any kind. It has not been evaluated by the FDA for safety or efficacy in those contexts. Cosmetic-grade copper peptide products sold elsewhere are a separate product category with different regulatory handling and different analytical disclosure."
      }
    ]
  }
];
