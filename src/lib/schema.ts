export const UNIFIED_ORGANIZATION_NODE = {
  '@type': 'Organization',
  '@id': 'https://helixbiochem.com/#organization',
  // Canonical brand name is "Helix Bio Chem" (matches the domain). "Helix Bio" is kept only as
  // alternateName so searches for the shorter form still resolve to this entity.
  'name': 'Helix Bio Chem',
  'alternateName': 'Helix Bio',
  'url': 'https://helixbiochem.com/',
  'logo': {
    '@type': 'ImageObject',
    'url': 'https://helixbiochem.com/HelixBio%20Images/hb-logo.webp',
  },
  'description': 'US supplier of research-grade peptides, sold strictly for laboratory research use only.',
  'email': 'support@helixbiochem.com',
  'sameAs': [
    'https://www.facebook.com/profile.php?id=61595200202970',
    'https://www.linkedin.com/in/helix-bio-chem-a1a9aa442/',
    'https://x.com/helixbiochem',
    'https://www.reddit.com/user/HelixBioChem/',
  ],
}

export const UNIFIED_WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': 'https://helixbiochem.com/#website',
  'url': 'https://helixbiochem.com/',
  'name': 'Helix Bio Chem',
  'alternateName': 'Helix Bio',
  'publisher': {
    '@id': 'https://helixbiochem.com/#organization',
  },
  // No SearchAction: the shop does not read a `q` parameter, so the old target URL never produced
  // search results (and Google no longer renders a sitelinks search box).
}
