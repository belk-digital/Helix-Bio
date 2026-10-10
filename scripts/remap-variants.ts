/**
 * Re-matches variant images to media by filename.
 *
 * This script previously assigned `productMedia[0]` — an arbitrary image from a loosely
 * matched pool — whenever it could not match a variant's strength. That scattered images
 * across unrelated products: a SEMAX nasal spray ended up on the BPC-157/TB-500 blend (the
 * token "blend" matched both), SEMAX images landed on all four Semaglutide variants, and
 * OXYTOCIN spray spread across five different spray products.
 *
 * It now refuses to guess. A variant is only reassigned when the candidate agrees on BOTH
 * packaging type (vial vs spray) and strength; otherwise it is left untouched and reported.
 *
 * Packaging is read from the media `alt` text as well as the filename, because filenames in
 * this library lie: media 215-280 are named like vials (Semaglutide_5MG.webp) but are spray
 * bottle photographs. The `alt` field is the reliable signal.
 *
 * Dry run by default. Pass --apply to write, and --force to also overwrite variants that
 * already have an image (default is to fill only empty ones).
 */
import 'dotenv/config';
import { getPayload } from 'payload';
import configPromise from '../src/payload.config';

const APPLY = process.argv.includes('--apply');
const FORCE = process.argv.includes('--force');

/** Tokens too generic to identify a product — "blend" alone matched four unrelated products. */
const STOP_TOKENS = new Set(['blend', 'spray', 'research', 'peptide', 'the', 'and', 'with', 'kit']);

/** Packaging is only trustworthy when filename AND alt are considered together. */
const isSpray = (text: string) => /spray/i.test(text);

/** "10mg", "5mg/5mg", "300mcg" -> comparable against a squashed filename. */
const squash = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '');

async function run() {
  const p = await getPayload({ config: configPromise });

  const products = await p.find({
    collection: 'products',
    limit: 1000,
    depth: 1
  });

  const media = await p.find({
    collection: 'media',
    limit: 1000,
  });

  let updatedCount = 0;
  const skipped: string[] = [];

  for (const prod of products.docs) {
    let needsUpdate = false;
    let dataToUpdate: any = {};

    let searchString = (prod.name || prod.slug).toLowerCase().replace(/[^a-z0-9]/g, ' ');
    if (prod.slug === 'cagrilintide') searchString += ' cag';
    if (prod.slug === 'glp-1trz') searchString += ' tirz';
    if (prod.slug === 'semaglutide') searchString += ' sema';
    if (prod.slug === 'glp-3rta') searchString += ' reta';
    if (prod.slug === 'melanotan-1') searchString += ' melanton'; // common typo in images
    if (prod.slug === 'melanotan-2') searchString += ' melanton';

    const searchTerms = searchString
      .split(' ')
      .filter(t => t.length > 2 && !STOP_TOKENS.has(t));

    // A product is a spray product if its slug says so; its images must agree.
    const productIsSpray = /spray/i.test(prod.slug || '');

    let productMedia = media.docs.filter(m => {
        const lowerFilename = m.filename.toLowerCase();
        if (!searchTerms.some(term => lowerFilename.includes(term))) return false;
        // Never let a spray bottle onto a vial product, or a vial onto a spray product.
        return isSpray(`${m.filename} ${m.alt || ''}`) === productIsSpray;
    });

    if (productMedia.length === 0) continue;

    if (prod.hasVariants && prod.variants && Array.isArray(prod.variants)) {
      const updatedVariants = prod.variants.map((v: any) => {
        const hasImage = Array.isArray(v.images) && v.images.length > 0;
        if (hasImage && !FORCE) return v; // don't disturb a variant that is already set

        // Find all option values (e.g., '10mg', '5mg')
        const variantOptions = v.options?.map((o:any) => squash(o.value)) || [];
        const sizeOption = variantOptions.find((opt: string) => opt.includes('mg') || opt.includes('mcg') || opt.includes('iu') || opt.includes('ml'));

        if (!sizeOption) {
          // No strength to key on. A single-variant product can take the sole candidate;
          // anything else would be a guess, so leave it alone.
          if (prod.variants.length === 1 && productMedia.length === 1) {
            return { ...v, images: [{ image: productMedia[0].id }] };
          }
          skipped.push(`${prod.slug} / ${v.sku}: no strength option to match on`);
          return v;
        }

        const variantMatch = productMedia.find(m => squash(m.filename).includes(sizeOption));

        if (!variantMatch) {
          // Previously this fell through to productMedia[0] and assigned an arbitrary image.
          // Leaving the variant untouched is the only safe outcome.
          skipped.push(`${prod.slug} / ${v.sku}: no ${productIsSpray ? 'spray' : 'vial'} image for "${sizeOption}"`);
          return v;
        }

        return {
          ...v,
          images: [{ image: variantMatch.id }]
        };
      });

      const variantsChanged = JSON.stringify(updatedVariants) !== JSON.stringify(prod.variants);
      if (variantsChanged) {
        dataToUpdate.variants = updatedVariants;
        needsUpdate = true;
      }
    }

    if (needsUpdate) {
      console.log(`Re-assigning variants for ${prod.slug}...`);
      if (APPLY) {
        await p.update({
          collection: 'products',
          id: prod.id,
          data: dataToUpdate
        });
      }
      updatedCount++;
    }
  }

  if (skipped.length) {
    console.log(`\nLeft untouched (no confident match — these need a correctly named image, not a guess):`);
    skipped.forEach(s => console.log(`  - ${s}`));
  }

  console.log(`\n${updatedCount} product(s) ${APPLY ? 'remapped' : 'would be remapped'}.`);
  if (!APPLY) console.log('Dry run — re-run with --apply to write (add --force to overwrite variants that already have an image).');
  process.exit(0);
}

run().catch(console.error);
