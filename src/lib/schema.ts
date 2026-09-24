export const UNIFIED_ORGANIZATION_NODE = {
  '@type': 'Organization',
  '@id': 'https://helixbiochem.com/#organization',
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
    'https://twitter.com/helixbiochem',
    'https://www.instagram.com/helixbiochem',
  ],
}

export const UNIFIED_WEBSITE_NODE = {
  '@type': 'WebSite',
  '@id': 'https://helixbiochem.com/#website',
  'url': 'https://helixbiochem.com/',
  'name': 'Helix Bio Chem',
  'publisher': {
    '@id': 'https://helixbiochem.com/#organization',
  },
  'potentialAction': {
    '@type': 'SearchAction',
    'target': {
      '@type': 'EntryPoint',
      'urlTemplate': 'https://helixbiochem.com/shop?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
}
