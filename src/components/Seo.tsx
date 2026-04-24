import React from 'react';
import { Helmet } from 'react-helmet-async';

type SeoProps = {
  title: string;
  description: string;
  canonicalPath?: string;
  ogImagePath?: string;
  jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
};

const SITE_ORIGIN = 'https://adparlay.com';

export default function Seo({
  title,
  description,
  canonicalPath,
  ogImagePath = '/logo512.png',
  jsonLd,
}: SeoProps) {
  const canonicalUrl = canonicalPath ? `${SITE_ORIGIN}${canonicalPath}` : undefined;
  const ogImageUrl = ogImagePath.startsWith('http') ? ogImagePath : `${SITE_ORIGIN}${ogImagePath}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />

      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="AdParlay" />
      <meta property="og:image" content={ogImageUrl} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImageUrl} />

      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  );
}

