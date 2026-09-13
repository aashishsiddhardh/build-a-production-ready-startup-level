import type { Herb } from '@/lib/types';

/**
 * Ayurvedic knowledge base.
 *
 * Evidence levels are deliberately conservative. Citations reference genuine
 * categories of literature (named classical texts, and the general modern
 * research literature by study type). They are educational pointers, NOT a
 * substitute for reading the primary sources, and the UI states this clearly.
 * We never fabricate a specific trial, DOI, or result.
 */
export const HERBS: Herb[] = [
  {
    id: 'ashwagandha',
    commonName: 'Ashwagandha',
    sanskritName: 'Ashwagandha',
    latinName: 'Withania somnifera',
    category: 'herb',
    summary:
      'A classic rasayana (rejuvenative) and adaptogen traditionally used to steady the nervous system, support restful sleep and rebuild stamina.',
    doshaEffect: { vata: -1, pitta: 0, kapha: -1 },
    targets: ['stress-anxiety', 'poor-sleep', 'low-energy', 'brain-fog', 'joint-pain'],
    evidence: 'moderate-clinical',
    evidenceNote:
      'Several randomized human trials report reductions in perceived stress and improvements in sleep quality; effect sizes vary and long-term safety data are limited.',
    citations: [
      { label: 'Charaka Samhita, Chikitsasthana (rasayana)', kind: 'classical-text' },
      {
        label: 'Randomized controlled trials on Withania somnifera for stress & sleep',
        kind: 'rct',
        note: 'Multiple small-to-moderate RCTs reported; verify against primary sources.',
      },
    ],
    commonForms: ['Root powder (churna)', 'Standardized root extract', 'Milk decoction at night'],
    contraindications: [
      { flag: 'pregnancy', severity: 'avoid', reason: 'Traditionally avoided in pregnancy; possible uterine effects.' },
      { flag: 'hyperthyroid', severity: 'caution', reason: 'May increase thyroid hormone levels.' },
      { flag: 'autoimmune', severity: 'caution', reason: 'May stimulate immune activity.' },
    ],
    interactions: [
      { drugClass: 'sedative', severity: 'moderate', effect: 'Additive sedation with anxiolytics/hypnotics.' },
      { drugClass: 'thyroid-hormone', severity: 'moderate', effect: 'May raise thyroid hormone levels and alter dosing needs.' },
      { drugClass: 'immunosuppressant', severity: 'moderate', effect: 'May counteract immunosuppressive therapy.' },
    ],
    qualities: ['grounding', 'warming', 'nourishing', 'calming'],
    safetyNotes: ['Rare reports of liver injury with certain extracts — stop and seek care if jaundice or dark urine occurs.'],
  },
  {
    id: 'turmeric',
    commonName: 'Turmeric (Curcumin)',
    sanskritName: 'Haridra',
    latinName: 'Curcuma longa',
    category: 'herb',
    summary:
      'A warming, bitter-pungent spice valued for supporting healthy inflammatory balance, digestion and skin clarity.',
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    targets: ['joint-pain', 'skin-issues', 'indigestion', 'low-immunity', 'cholesterol'],
    evidence: 'moderate-clinical',
    evidenceNote:
      'Curcumin has been studied in multiple trials for knee osteoarthritis and inflammatory markers; bioavailability is low unless formulated with piperine or lipids.',
    citations: [
      { label: 'Bhavaprakasha Nighantu (Haridra)', kind: 'classical-text' },
      {
        label: 'Meta-analyses of Curcuma longa in osteoarthritis & inflammation',
        kind: 'review',
        note: 'Several systematic reviews exist; consult primary literature for effect sizes.',
      },
    ],
    commonForms: ['Golden milk (haldi doodh)', 'Powder with black pepper', 'Standardized curcumin extract'],
    contraindications: [
      { flag: 'bleeding-disorder', severity: 'caution', reason: 'High doses may reduce platelet aggregation.' },
      { flag: 'surgery-scheduled', severity: 'caution', reason: 'Discontinue high-dose extracts before surgery.' },
      { flag: 'peptic-ulcer', severity: 'caution', reason: 'High doses may irritate an active ulcer in some people.' },
    ],
    interactions: [
      { drugClass: 'anticoagulant', severity: 'moderate', effect: 'Theoretical additive bleeding risk at high extract doses.' },
      { drugClass: 'antiplatelet', severity: 'moderate', effect: 'Theoretical additive bleeding risk at high extract doses.' },
      { drugClass: 'antidiabetic', severity: 'moderate', effect: 'May enhance glucose-lowering; monitor for hypoglycemia.' },
    ],
    qualities: ['warming', 'bitter', 'pungent', 'drying'],
    safetyNotes: ['Culinary amounts are widely considered safe; concentrated extracts are the source of most interactions.'],
  },
  {
    id: 'brahmi',
    commonName: 'Brahmi',
    sanskritName: 'Brahmi',
    latinName: 'Bacopa monnieri',
    category: 'herb',
    summary:
      'A cooling medhya rasayana (nervine tonic) traditionally used to support memory, learning and a calm, focused mind.',
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 },
    targets: ['brain-fog', 'stress-anxiety', 'poor-sleep', 'headache'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Some randomized trials suggest modest improvements in memory acquisition and retention over 8–12 weeks; onset is gradual.',
    citations: [
      { label: 'Charaka Samhita (medhya rasayana)', kind: 'classical-text' },
      {
        label: 'Randomized trials of Bacopa monnieri on cognition',
        kind: 'rct',
        note: 'Small trials with gradual effects; verify primary sources.',
      },
    ],
    commonForms: ['Powder in warm water or ghee', 'Standardized bacosides extract', 'Brahmi ghrita'],
    contraindications: [
      { flag: 'hypothyroid', severity: 'caution', reason: 'May increase thyroid hormone in preclinical models.' },
    ],
    interactions: [
      { drugClass: 'sedative', severity: 'moderate', effect: 'Possible additive calming/sedative effect.' },
      { drugClass: 'thyroid-hormone', severity: 'theoretical', effect: 'Theoretical influence on thyroid hormone levels.' },
    ],
    qualities: ['cooling', 'bitter', 'calming', 'clarifying'],
    safetyNotes: ['May cause mild digestive upset if taken on an empty stomach.'],
  },
  {
    id: 'triphala',
    commonName: 'Triphala',
    sanskritName: 'Triphala',
    latinName: 'Terminalia chebula, Terminalia bellirica, Emblica officinalis',
    category: 'formulation',
    summary:
      'A balanced three-fruit formulation used gently for digestion, regularity and internal cleansing without harsh purging.',
    doshaEffect: { vata: -1, pitta: -1, kapha: -1 },
    targets: ['constipation', 'indigestion', 'skin-issues', 'low-immunity'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Preliminary human and laboratory studies suggest gentle laxative, antioxidant and gut-supportive effects; rigorous large trials are limited.',
    citations: [
      { label: 'Ashtanga Hridayam (Triphala yoga)', kind: 'classical-text' },
      { label: 'Preliminary studies on Triphala and gut health', kind: 'review' },
    ],
    commonForms: ['Powder steeped in warm water at night', 'Tablets'],
    contraindications: [
      { flag: 'pregnancy', severity: 'caution', reason: 'Strong laxative effect is traditionally avoided in pregnancy.' },
    ],
    interactions: [
      { drugClass: 'antidiabetic', severity: 'theoretical', effect: 'Amla component may modestly influence glucose; monitor.' },
    ],
    qualities: ['balancing', 'astringent', 'gently-cleansing'],
    safetyNotes: ['Can loosen stools if the dose is too high — reduce the amount if this happens.'],
  },
  {
    id: 'tulsi',
    commonName: 'Tulsi (Holy Basil)',
    sanskritName: 'Tulasi',
    latinName: 'Ocimum sanctum',
    category: 'herb',
    summary:
      'A revered adaptogenic aromatic used to ease stress, clear the chest and support seasonal immunity.',
    doshaEffect: { vata: -1, pitta: 0, kapha: -1 },
    targets: ['stress-anxiety', 'low-immunity', 'cough-congestion', 'blood-sugar'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Small human studies report reductions in perceived stress and modest metabolic effects; evidence quality is limited.',
    citations: [
      { label: 'Bhavaprakasha (Tulasi)', kind: 'classical-text' },
      { label: 'Preliminary human studies on Ocimum sanctum & stress', kind: 'review' },
    ],
    commonForms: ['Fresh leaf tea', 'Dried leaf powder', 'Tincture'],
    contraindications: [
      { flag: 'bleeding-disorder', severity: 'caution', reason: 'May have mild antiplatelet activity.' },
      { flag: 'surgery-scheduled', severity: 'caution', reason: 'Discontinue before surgery due to possible blood-thinning.' },
      { flag: 'pregnancy', severity: 'caution', reason: 'Traditionally used cautiously in pregnancy.' },
    ],
    interactions: [
      { drugClass: 'anticoagulant', severity: 'theoretical', effect: 'Theoretical additive bleeding risk.' },
      { drugClass: 'antidiabetic', severity: 'moderate', effect: 'May lower blood glucose; monitor for hypoglycemia.' },
    ],
    qualities: ['warming', 'aromatic', 'uplifting', 'clearing'],
    safetyNotes: ['Generally well tolerated as a tea.'],
  },
  {
    id: 'ginger',
    commonName: 'Ginger',
    sanskritName: 'Ardraka / Shunthi',
    latinName: 'Zingiber officinale',
    category: 'herb',
    summary:
      'A warming digestive (deepana-pachana) that kindles agni, eases nausea and supports circulation.',
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    targets: ['indigestion', 'cough-congestion', 'low-energy', 'joint-pain'],
    evidence: 'moderate-clinical',
    evidenceNote:
      'Ginger has reasonably consistent evidence for reducing nausea (including pregnancy-related and motion sickness) and some support for digestive comfort.',
    citations: [
      { label: 'Charaka Samhita (deepana-pachana dravya)', kind: 'classical-text' },
      { label: 'Systematic reviews of Zingiber officinale for nausea', kind: 'review' },
    ],
    commonForms: ['Fresh ginger tea', 'Dry ginger (shunthi) powder', 'With honey and lemon'],
    contraindications: [
      { flag: 'bleeding-disorder', severity: 'caution', reason: 'High doses may affect platelet function.' },
      { flag: 'peptic-ulcer', severity: 'caution', reason: 'May aggravate heartburn or an active ulcer in some people.' },
    ],
    interactions: [
      { drugClass: 'anticoagulant', severity: 'moderate', effect: 'Possible additive bleeding risk at high doses.' },
      { drugClass: 'antidiabetic', severity: 'theoretical', effect: 'May modestly lower blood glucose.' },
    ],
    qualities: ['warming', 'pungent', 'stimulating', 'digestive'],
    safetyNotes: ['Being warming, it can aggravate pitta/acidity if overused.'],
  },
  {
    id: 'boswellia',
    commonName: 'Boswellia (Shallaki)',
    sanskritName: 'Shallaki',
    latinName: 'Boswellia serrata',
    category: 'herb',
    summary:
      'A resin traditionally used for joint comfort and healthy inflammatory response, especially for vata-type stiffness.',
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 },
    targets: ['joint-pain', 'cough-congestion'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Several small trials suggest improvements in knee osteoarthritis comfort and function; larger confirmatory trials are limited.',
    citations: [
      { label: 'Sushruta Samhita (Shallaki)', kind: 'classical-text' },
      { label: 'Trials of Boswellia serrata extract in osteoarthritis', kind: 'rct' },
    ],
    commonForms: ['Standardized resin extract', 'Traditional guggulu-style tablets'],
    contraindications: [
      { flag: 'pregnancy', severity: 'caution', reason: 'Insufficient safety data in pregnancy.' },
    ],
    interactions: [
      { drugClass: 'nsaid', severity: 'theoretical', effect: 'May allow lower NSAID doses; do not change medication without your clinician.' },
      { drugClass: 'immunosuppressant', severity: 'theoretical', effect: 'Theoretical immune-modulating interaction.' },
    ],
    qualities: ['cooling', 'astringent', 'soothing'],
    safetyNotes: ['May cause mild stomach upset in some people.'],
  },
  {
    id: 'guduchi',
    commonName: 'Guduchi (Giloy)',
    sanskritName: 'Guduchi',
    latinName: 'Tinospora cordifolia',
    category: 'herb',
    summary:
      'A bitter rasayana used for immunity, fever recovery and as a general tonic ("amrita").',
    doshaEffect: { vata: -1, pitta: -1, kapha: -1 },
    targets: ['low-immunity', 'joint-pain', 'skin-issues', 'blood-sugar'],
    evidence: 'preclinical',
    evidenceNote:
      'Mostly laboratory and animal evidence for immune-modulating effects; strong human data are lacking.',
    citations: [
      { label: 'Charaka Samhita (Guduchi rasayana)', kind: 'classical-text' },
      { label: 'Preclinical studies on Tinospora cordifolia', kind: 'review' },
    ],
    commonForms: ['Stem decoction (kwath)', 'Satva (starch extract)', 'Tablets'],
    contraindications: [
      { flag: 'autoimmune', severity: 'avoid', reason: 'Immune stimulation may worsen autoimmune activity.' },
      { flag: 'liver-disease', severity: 'avoid', reason: 'Reports of drug-induced liver injury linked to some products.' },
    ],
    interactions: [
      { drugClass: 'immunosuppressant', severity: 'moderate', effect: 'May counteract immunosuppressive therapy.' },
      { drugClass: 'antidiabetic', severity: 'moderate', effect: 'May add to glucose-lowering effect.' },
    ],
    qualities: ['bitter', 'cooling', 'cleansing'],
    safetyNotes: ['Given reports of liver injury, avoid unverified products and stop if you notice jaundice, nausea or dark urine.'],
  },
  {
    id: 'shatavari',
    commonName: 'Shatavari',
    sanskritName: 'Shatavari',
    latinName: 'Asparagus racemosus',
    category: 'herb',
    summary:
      'A cooling, nourishing tonic traditionally used to support female reproductive wellness, hydration and digestion.',
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    targets: ['womens-wellness', 'acid-reflux', 'low-energy', 'indigestion'],
    evidence: 'traditional',
    evidenceNote:
      'Predominantly classical and traditional use with limited modern clinical validation.',
    citations: [
      { label: 'Sushruta Samhita (Shatavari)', kind: 'classical-text' },
      { label: 'Ethnobotanical monographs on Asparagus racemosus', kind: 'monograph' },
    ],
    commonForms: ['Root powder in warm milk', 'Ghee preparations', 'Tablets'],
    contraindications: [
      { flag: 'kidney-disease', severity: 'caution', reason: 'Mild diuretic action warrants caution in kidney disease.' },
    ],
    interactions: [
      { drugClass: 'diuretic', severity: 'theoretical', effect: 'Possible additive diuretic effect.' },
    ],
    qualities: ['cooling', 'sweet', 'nourishing', 'moistening'],
    safetyNotes: ['Being kapha-building, it may feel heavy for those with sluggish digestion.'],
  },
  {
    id: 'guggul',
    commonName: 'Guggul',
    sanskritName: 'Guggulu',
    latinName: 'Commiphora mukul',
    category: 'herb',
    summary:
      'A scraping (lekhana) resin traditionally used for lipid balance, joint comfort and healthy metabolism.',
    doshaEffect: { vata: 0, pitta: 0, kapha: -1 },
    targets: ['cholesterol', 'joint-pain', 'low-energy', 'fluid-retention'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Human trials on lipid effects are mixed and older; quality varies and results are not consistent.',
    citations: [
      { label: 'Sushruta Samhita (Guggulu kalpana)', kind: 'classical-text' },
      { label: 'Mixed clinical trials of Commiphora mukul on lipids', kind: 'rct' },
    ],
    commonForms: ['Purified guggulu tablets', 'Classical formulations (e.g., Yogaraj Guggulu)'],
    contraindications: [
      { flag: 'hyperthyroid', severity: 'caution', reason: 'May stimulate thyroid function.' },
      { flag: 'hypothyroid', severity: 'caution', reason: 'Can alter thyroid hormone levels; monitor.' },
      { flag: 'pregnancy', severity: 'avoid', reason: 'May stimulate the uterus; avoid in pregnancy.' },
      { flag: 'bleeding-disorder', severity: 'caution', reason: 'May affect platelet function.' },
    ],
    interactions: [
      { drugClass: 'thyroid-hormone', severity: 'moderate', effect: 'May alter thyroid hormone requirements.' },
      { drugClass: 'anticoagulant', severity: 'moderate', effect: 'Possible additive bleeding risk.' },
      { drugClass: 'antihypertensive', severity: 'theoretical', effect: 'May reduce absorption of some cardiovascular drugs (e.g., propranolol).' },
    ],
    qualities: ['warming', 'scraping', 'drying', 'lightening'],
    safetyNotes: ['Can cause GI upset or skin rash in some people.'],
  },
  {
    id: 'fenugreek',
    commonName: 'Fenugreek (Methi)',
    sanskritName: 'Methika',
    latinName: 'Trigonella foenum-graecum',
    category: 'herb',
    summary:
      'A warming culinary seed traditionally used for digestion, healthy blood sugar and lactation support.',
    doshaEffect: { vata: -1, pitta: 1, kapha: -1 },
    targets: ['blood-sugar', 'indigestion', 'cholesterol', 'womens-wellness'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Some trials suggest modest improvements in fasting glucose and lipids; it is not a replacement for prescribed diabetes care.',
    citations: [
      { label: 'Bhavaprakasha (Methika)', kind: 'classical-text' },
      { label: 'Trials of Trigonella foenum-graecum on glycemic control', kind: 'rct' },
    ],
    commonForms: ['Soaked seeds', 'Seed powder', 'Sprouted seeds in food'],
    contraindications: [
      { flag: 'pregnancy', severity: 'avoid', reason: 'May stimulate uterine activity at medicinal doses.' },
    ],
    interactions: [
      { drugClass: 'antidiabetic', severity: 'moderate', effect: 'May enhance glucose-lowering; monitor for hypoglycemia.' },
      { drugClass: 'anticoagulant', severity: 'theoretical', effect: 'Contains coumarin-like compounds; theoretical additive effect at high doses.' },
    ],
    qualities: ['warming', 'bitter', 'digestive'],
    safetyNotes: ['May cause a maple-like body odor; can trigger reactions in people allergic to legumes/peanuts.'],
  },
  {
    id: 'licorice',
    commonName: 'Licorice (Yashtimadhu)',
    sanskritName: 'Yashtimadhu',
    latinName: 'Glycyrrhiza glabra',
    category: 'herb',
    summary:
      'A sweet, cooling, soothing herb traditionally used for the throat, dry cough and a settled stomach.',
    doshaEffect: { vata: -1, pitta: -1, kapha: 1 },
    targets: ['acid-reflux', 'cough-congestion', 'skin-issues'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Deglycyrrhizinated licorice (DGL) has some support for soothing the stomach lining; whole licorice carries meaningful blood-pressure risks.',
    citations: [
      { label: 'Charaka Samhita (Yashtimadhu)', kind: 'classical-text' },
      { label: 'Studies on licorice/DGL for gastric comfort', kind: 'review' },
    ],
    commonForms: ['DGL lozenges', 'Root decoction (short-term)', 'Throat teas'],
    contraindications: [
      { flag: 'hypertension', severity: 'avoid', reason: 'Glycyrrhizin can raise blood pressure and lower potassium.' },
      { flag: 'kidney-disease', severity: 'avoid', reason: 'Risk of sodium/water retention and low potassium.' },
      { flag: 'pregnancy', severity: 'avoid', reason: 'High intake is linked to adverse pregnancy outcomes.' },
    ],
    interactions: [
      { drugClass: 'diuretic', severity: 'severe', effect: 'Compounds potassium loss — risk of dangerous hypokalemia.' },
      { drugClass: 'antihypertensive', severity: 'moderate', effect: 'May counteract blood-pressure control.' },
    ],
    qualities: ['sweet', 'cooling', 'soothing', 'moistening'],
    safetyNotes: ['Prefer DGL and avoid prolonged high doses of whole licorice.'],
  },
  {
    id: 'amla',
    commonName: 'Amla (Amalaki)',
    sanskritName: 'Amalaki',
    latinName: 'Emblica officinalis',
    category: 'herb',
    summary:
      'A cooling, vitamin-C-rich fruit and premier rasayana used for digestion, skin, hair and gentle rejuvenation.',
    doshaEffect: { vata: -1, pitta: -1, kapha: -1 },
    targets: ['acid-reflux', 'skin-issues', 'low-immunity', 'indigestion', 'cholesterol'],
    evidence: 'preliminary-clinical',
    evidenceNote:
      'Preliminary studies suggest antioxidant and lipid effects; robust confirmatory trials are limited.',
    citations: [
      { label: 'Charaka Samhita (Amalaki rasayana)', kind: 'classical-text' },
      { label: 'Preliminary trials on Emblica officinalis', kind: 'review' },
    ],
    commonForms: ['Fresh fruit or juice', 'Powder', 'Component of Triphala & Chyawanprash'],
    contraindications: [
      { flag: 'bleeding-disorder', severity: 'caution', reason: 'May have mild antiplatelet activity at high doses.' },
    ],
    interactions: [
      { drugClass: 'anticoagulant', severity: 'theoretical', effect: 'Theoretical additive bleeding risk at high doses.' },
      { drugClass: 'antidiabetic', severity: 'theoretical', effect: 'May modestly support glucose balance.' },
    ],
    qualities: ['cooling', 'sour', 'rejuvenating', 'balancing'],
    safetyNotes: ['Generally very well tolerated in food amounts.'],
  },
  {
    id: 'neem',
    commonName: 'Neem',
    sanskritName: 'Nimba',
    latinName: 'Azadirachta indica',
    category: 'herb',
    summary:
      'A very bitter, cooling herb traditionally used topically and internally for skin clarity and pitta-kapha purification.',
    doshaEffect: { vata: 1, pitta: -1, kapha: -1 },
    targets: ['skin-issues', 'blood-sugar', 'low-immunity'],
    evidence: 'preclinical',
    evidenceNote:
      'Mostly laboratory evidence for antimicrobial and metabolic effects; human data are limited and internal use needs caution.',
    citations: [
      { label: 'Sushruta Samhita (Nimba)', kind: 'classical-text' },
      { label: 'Preclinical studies on Azadirachta indica', kind: 'review' },
    ],
    commonForms: ['Topical oil/paste', 'Leaf capsules (short-term)', 'Face washes'],
    contraindications: [
      { flag: 'pregnancy', severity: 'avoid', reason: 'Internal neem may be abortifacient; avoid in pregnancy and when trying to conceive.' },
      { flag: 'child', severity: 'avoid', reason: 'Neem oil has caused serious toxicity in infants and children.' },
    ],
    interactions: [
      { drugClass: 'antidiabetic', severity: 'moderate', effect: 'May add to glucose-lowering effect.' },
      { drugClass: 'immunosuppressant', severity: 'theoretical', effect: 'May modulate immune activity.' },
    ],
    qualities: ['very bitter', 'cooling', 'drying', 'purifying'],
    safetyNotes: ['Prefer topical use; internal neem should be short-term and well-sourced. Never give neem oil to infants.'],
  },
  {
    id: 'fennel',
    commonName: 'Fennel',
    sanskritName: 'Mishreya',
    latinName: 'Foeniculum vulgare',
    category: 'herb',
    summary:
      'A cooling, sweet digestive seed chewed after meals to ease bloating and freshen the breath without aggravating pitta.',
    doshaEffect: { vata: -1, pitta: -1, kapha: 0 },
    targets: ['indigestion', 'acid-reflux', 'constipation'],
    evidence: 'traditional',
    evidenceNote:
      'Long traditional use as a carminative; some small studies on digestive comfort and infant colic exist.',
    citations: [
      { label: 'Bhavaprakasha (Mishreya)', kind: 'classical-text' },
      { label: 'Small studies on fennel for digestive comfort', kind: 'review' },
    ],
    commonForms: ['Post-meal seeds', 'Fennel tea', 'CCF tea (cumin-coriander-fennel)'],
    contraindications: [],
    interactions: [],
    qualities: ['cooling', 'sweet', 'carminative', 'soothing'],
    safetyNotes: ['Widely used and well tolerated as a food and tea.'],
  },
  {
    id: 'punarnava',
    commonName: 'Punarnava',
    sanskritName: 'Punarnava',
    latinName: 'Boerhavia diffusa',
    category: 'herb',
    summary:
      'A herb traditionally used to support healthy fluid balance and kidney/urinary comfort ("that which renews").',
    doshaEffect: { vata: 0, pitta: -1, kapha: -1 },
    targets: ['fluid-retention', 'low-energy'],
    evidence: 'preclinical',
    evidenceNote:
      'Diuretic and metabolic effects are largely from laboratory/animal models; human evidence is limited.',
    citations: [
      { label: 'Charaka Samhita (Punarnava)', kind: 'classical-text' },
      { label: 'Preclinical studies on Boerhavia diffusa', kind: 'review' },
    ],
    commonForms: ['Decoction', 'Powder', 'Classical formulations (Punarnavadi)'],
    contraindications: [
      { flag: 'kidney-disease', severity: 'caution', reason: 'Diuretic action needs medical supervision in kidney disease.' },
    ],
    interactions: [
      { drugClass: 'diuretic', severity: 'moderate', effect: 'Additive diuretic effect; risk of dehydration/electrolyte shifts.' },
      { drugClass: 'lithium', severity: 'moderate', effect: 'Diuretics can raise lithium levels; monitor closely.' },
    ],
    qualities: ['bitter', 'light', 'draining'],
    safetyNotes: ['Ensure adequate hydration; use under guidance if you take diuretics.'],
  },
  {
    id: 'chyawanprash',
    commonName: 'Chyawanprash',
    sanskritName: 'Chyawanprasha',
    latinName: 'Herbal jam (Amalaki base)',
    category: 'formulation',
    summary:
      'A classical amla-based herbal jam taken as a daily rasayana for immunity, energy and respiratory resilience.',
    doshaEffect: { vata: -1, pitta: 0, kapha: 1 },
    targets: ['low-immunity', 'low-energy', 'cough-congestion'],
    evidence: 'traditional',
    evidenceNote:
      'Traditional daily tonic; a few small studies exist but rigorous evidence is limited.',
    citations: [
      { label: 'Charaka Samhita (Chyawanprasha rasayana)', kind: 'classical-text' },
      { label: 'Small studies on Chyawanprash and immunity', kind: 'review' },
    ],
    commonForms: ['1 teaspoon in the morning, often with warm milk'],
    contraindications: [
      { flag: 'diabetes', severity: 'caution', reason: 'Contains sugar/jaggery; account for the carbohydrate load.' },
    ],
    interactions: [
      { drugClass: 'antidiabetic', severity: 'theoretical', effect: 'Sugar content may affect glucose readings.' },
    ],
    qualities: ['nourishing', 'sweet', 'rejuvenating', 'warming'],
    safetyNotes: ['High sugar content — choose a sugar-free version if managing blood glucose.'],
  },
  {
    id: 'sitopaladi',
    commonName: 'Sitopaladi Churna',
    sanskritName: 'Sitopaladi',
    latinName: 'Herbal powder blend',
    category: 'formulation',
    summary:
      'A sweet-pungent classical powder used for dry or productive cough, chest congestion and post-illness recovery.',
    doshaEffect: { vata: -1, pitta: -1, kapha: -1 },
    targets: ['cough-congestion', 'low-immunity'],
    evidence: 'traditional',
    evidenceNote:
      'Widely used traditionally for respiratory comfort; modern clinical data are sparse.',
    citations: [
      { label: 'Sharangdhara Samhita (Sitopaladi churna)', kind: 'classical-text' },
      { label: 'Traditional monographs on Sitopaladi', kind: 'monograph' },
    ],
    commonForms: ['Powder with honey', 'With warm water'],
    contraindications: [
      { flag: 'diabetes', severity: 'caution', reason: 'Often taken with honey/sugar; account for carbohydrates.' },
    ],
    interactions: [],
    qualities: ['soothing', 'warming', 'clearing'],
    safetyNotes: ['For a lingering or worsening cough, or any breathing difficulty, seek medical care.'],
  },
];

export const HERB_MAP: Record<string, Herb> = Object.fromEntries(HERBS.map((h) => [h.id, h]));
