import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { ThankYouCard } from '@/features/survey-editor/components/ThankYouCard';
import { ThankYouPage } from '@/features/survey-editor/components/ThankYouPage';
import { WelcomePage } from '@/features/survey-editor/components/WelcomePage';

describe('survey entry and exit pages', () => {
  it('does not render a fake continue action on the thank-you page when no redirect is configured', () => {
    const html = renderToStaticMarkup(
      <ThankYouPage
        thankYouTitle="Thanks"
        thankYouMessage="We have everything we need."
        thankYouButtonText="Continue"
        redirectUrl=""
      />,
    );

    expect(html).not.toContain('>Continue<');
    expect(html).toContain('You can now close this tab');
  });

  it('renders the thank-you action and redirect target only when a redirect exists', () => {
    const html = renderToStaticMarkup(
      <ThankYouPage
        thankYouTitle="Thanks"
        thankYouMessage="We have everything we need."
        thankYouButtonText="Continue"
        redirectUrl="https://example.com/next"
      />,
    );

    expect(html).toContain('>Continue<');
    expect(html).toContain('https://example.com/next');
    expect(html).not.toContain('You can now close this tab');
  });

  it('does not render welcome or thank-you badges in the survey pages', () => {
    const welcomeHtml = renderToStaticMarkup(
      <WelcomePage
        welcomeTitle="Welcome"
        welcomeMessage="Please answer a few questions."
        welcomeInstructions="2 min"
        welcomeButtonText="Start"
      />,
    );

    const thankYouHtml = renderToStaticMarkup(
      <ThankYouPage
        thankYouTitle="Thanks"
        thankYouMessage="All set."
        thankYouButtonText=""
        redirectUrl=""
      />,
    );

    expect(welcomeHtml).not.toContain('Welcome Page');
    expect(thankYouHtml).not.toContain('Thank You Page');
  });

  it('renders the editor thank-you button label even without redirect while keeping the close-tab message', () => {
    const html = renderToStaticMarkup(
      <ThankYouCard
        thankYouTitle="Thanks"
        thankYouMessage="All set."
        thankYouButtonText="Finish"
        redirectUrl=""
        onThankYouTitleChange={() => {}}
        onThankYouMessageChange={() => {}}
        onThankYouButtonTextChange={() => {}}
        onRedirectUrlChange={() => {}}
      />,
    );

    expect(html).toContain('>Finish<');
    expect(html).toContain('You can now close this tab');
  });

  it('renders the editor thank-you redirect target when configured', () => {
    const html = renderToStaticMarkup(
      <ThankYouCard
        thankYouTitle="Thanks"
        thankYouMessage="All set."
        thankYouButtonText="Continue"
        redirectUrl="https://example.com/next"
        onThankYouTitleChange={() => {}}
        onThankYouMessageChange={() => {}}
        onThankYouButtonTextChange={() => {}}
        onRedirectUrlChange={() => {}}
      />,
    );

    expect(html).toContain('>Continue<');
    expect(html).toContain('https://example.com/next');
    expect(html).not.toContain('You can now close this tab');
  });
});
