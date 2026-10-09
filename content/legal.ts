// The Privacy Policy (/privacy) and Terms of Service (/terms).
//
// Fill in the [bracketed] details below before launch, and have a lawyer
// review both documents: they're a solid starting point written for how
// Designjoy works, not legal advice.

export const LEGAL = {
  /** Your registered business name, e.g. "Designjoy LLC". */
  company: "[Designjoy LLC]",
  /** Where questions and requests about these documents should go. */
  email: "[your contact email]",
  /** The state whose laws govern the Terms, e.g. "Arizona". */
  state: "[your state]",
  updated: "October 9, 2026",
};

/** A paragraph, or a list of bullet points. */
export type LegalBlock = string | string[];
export type LegalSection = { heading: string; body: LegalBlock[] };
export type LegalDoc = { title: string; intro: string; sections: LegalSection[] };

const { company, email, state } = LEGAL;

export const privacyPolicy: LegalDoc = {
  title: "Privacy Policy",
  intro: `This policy explains what information ${company} ("Designjoy", "we", "us") collects when you visit designjoy.co, chat with our assistant, book a call or subscribe, and what we do with it. The short version: we collect what we need to run the service, we don't sell your information, and you can ask us to delete it.`,
  sections: [
    {
      heading: "Information you give us",
      body: [
        "When you use the site or subscribe, you may give us:",
        [
          "Contact details: your name, email address, and company name.",
          "Subscription details: the plan you choose, and an email for your Trello invite if it's different from your billing email.",
          "Booking details: the time you pick for an intro call and your reason for the meeting.",
          "Questions you type into the ask box on the site.",
          "Project materials: briefs, files, references and feedback you share with us in Trello, Slack or by email.",
        ],
        "Payments are handled by Stripe. Your card details go straight to Stripe and never touch our servers; we only see things like the last four digits of your card, its expiry month and the payment status.",
      ],
    },
    {
      heading: "Information collected automatically",
      body: [
        "Like most websites, our hosting provider records basic technical information when you visit, such as your IP address, browser type, the pages you request and the time of the request. We use this to keep the site running, secure and fast.",
        "We don't use advertising or tracking cookies. Stripe and Cal.com may set cookies needed for payments and scheduling to work securely (for example, to prevent fraud).",
      ],
    },
    {
      heading: "How we use your information",
      body: [
        [
          "To provide the service: set up your Trello board (and Slack channel on Design Partner), work on your requests and deliver your designs.",
          "To bill you, send receipts and manage your subscription.",
          "To book and run intro calls.",
          "To answer questions you ask on the site.",
          "To communicate with you about your account, your requests and important changes.",
          "To keep the site secure and prevent fraud or abuse.",
          "To comply with legal obligations.",
        ],
        "We don't sell your personal information, and we don't share it for advertising.",
      ],
    },
    {
      heading: "The AI ask box",
      body: [
        "The ask box on our site uses OpenAI to answer questions from our knowledge base. When you ask a question, the conversation is sent to OpenAI to generate a reply. Under OpenAI's API terms, this data isn't used to train their models and is kept for a limited time (up to 30 days) for abuse monitoring. Please don't share sensitive personal information in the chat.",
        "Answers from the assistant are for general information and may occasionally be wrong. The Terms of Service and what we confirm with you directly take precedence.",
      ],
    },
    {
      heading: "Who we share information with",
      body: [
        "We share information only with service providers that help us run Designjoy, and only what they need to do their job:",
        [
          "Stripe: payments, invoices, receipts and the billing portal.",
          "Cal.com: scheduling intro calls and sending calendar invites.",
          "OpenAI: generating answers in the ask box.",
          "Vercel: hosting the website and storing site content.",
          "Trello (Atlassian) and Slack: collaborating on your requests.",
          "Our email provider: sending and receiving email.",
        ],
        "We may also share information if required by law, to protect our rights or the safety of others, or as part of a merger or sale of the business (in which case this policy would continue to apply).",
      ],
    },
    {
      heading: "How long we keep it",
      body: [
        "We keep account and billing records for as long as you're a client and afterwards as long as needed for tax, accounting and legal purposes. Project files and conversations are kept while you're a client and for a reasonable time after, so you can come back to them. You can ask us to delete your information sooner, subject to what we're legally required to keep.",
      ],
    },
    {
      heading: "Security",
      body: [
        "We use reputable providers and sensible safeguards to protect your information, and access to it is limited to people who need it. No method of storage or transmission is completely secure, so we can't guarantee absolute security.",
      ],
    },
    {
      heading: "Your choices and rights",
      body: [
        "Depending on where you live, you may have the right to access, correct, delete or get a copy of your personal information, or to object to or restrict how we use it. To make a request, email us at " +
          email +
          ". We'll respond within the time required by law and won't treat you differently for exercising your rights.",
        "You can update your card, see invoices or cancel your subscription anytime at designjoy.co/billing. You can unsubscribe from any non-essential emails using the link in them.",
      ],
    },
    {
      heading: "International visitors",
      body: [
        "Designjoy is based in the United States, and our service providers may process information in the United States and other countries. By using the site, you understand your information may be transferred to and processed in those countries, which may have different data protection laws than yours.",
      ],
    },
    {
      heading: "Children",
      body: [
        "Designjoy is a service for businesses and isn't directed at children under 16. We don't knowingly collect their personal information.",
      ],
    },
    {
      heading: "Changes to this policy",
      body: [
        "We may update this policy from time to time. We'll post the new version here with a new date, and if the changes are significant we'll let current clients know by email.",
      ],
    },
    {
      heading: "Contact",
      body: [`Questions about this policy or your information? Email ${email}.`],
    },
  ],
};

export const termsOfService: LegalDoc = {
  title: "Terms of Service",
  intro: `These terms are an agreement between you and ${company} ("Designjoy", "we", "us") and apply when you use designjoy.co or subscribe to Designjoy. By subscribing or using the site, you agree to them. If you're subscribing for a company, you confirm you're allowed to accept these terms on its behalf.`,
  sections: [
    {
      heading: "The service",
      body: [
        "Designjoy is a design subscription. For a flat monthly fee, you can submit design requests and we work through them. Requests and deliverables are managed in a Trello board we set up for you.",
        [
          "Monthly Club: one active request at a time, with an unlimited backlog. Communication is asynchronous, through Trello.",
          "Design Partner: everything in Monthly Club, plus daily design updates and direct communication in a shared Slack channel.",
        ],
        "The plans, prices and what's included are as shown on the site when you subscribe. We may add, change or remove features over time and will tell you about changes that materially affect your plan.",
      ],
    },
    {
      heading: "Requests, delivery and revisions",
      body: [
        "You add requests to your Backlog and move one into Current request when you're ready. You can describe a request in as much or as little detail as you like; where details are missing, we'll use our judgement.",
        "Most requests are delivered in about 48 hours (business days) and revisions in about 24 hours. These are typical averages, not guarantees: larger or more complex requests may be split into smaller pieces and take longer. Revisions are unlimited while you're subscribed.",
        "We decide which requests fit the service. We may decline requests that are outside the scope of design and front-end work we offer, or that we believe are illegal, harmful, infringing or otherwise inappropriate.",
      ],
    },
    {
      heading: "Billing",
      body: [
        "Subscriptions are billed monthly in advance through Stripe and renew automatically each month until you cancel. By subscribing, you authorise us to charge your payment method each billing period.",
        "Prices don't include taxes, which are added where required. If we change our prices, we'll let you know in advance, and the new price will apply from your next billing period after the notice.",
        "If a payment fails, we'll let you know and may pause work until it's resolved.",
      ],
    },
    {
      heading: "Pausing and cancelling",
      body: [
        "You can cancel anytime at designjoy.co/billing. Cancellation takes effect at the end of your current billing period; you keep access until then and won't be charged again.",
        "If you'd like to pause your subscription instead, just let us know and we'll arrange it.",
        "Because the service is provided on a monthly basis and work begins right away, payments are non-refundable, including for partial months, except where required by law.",
      ],
    },
    {
      heading: "Your materials",
      body: [
        "You keep ownership of anything you give us, such as briefs, logos, copy, images and other files. You confirm you have the rights to share them with us and to have us use them in your designs, and you give us permission to use them for that purpose.",
      ],
    },
    {
      heading: "Ownership of the work",
      body: [
        "Once a deliverable has been paid for through your subscription, you own the final deliverables we create for you, and we assign to you our rights in them.",
        "Some designs include third-party assets such as fonts, stock photos, icons or code libraries. These remain owned by their creators and are subject to their own licenses, which you may need to purchase or follow.",
        "We keep ownership of our general know-how, tools, templates and techniques. Unless you ask us not to, we may show work we've created for you in our portfolio and marketing after it's public. Just let us know if you'd like something kept private.",
      ],
    },
    {
      heading: "Confidentiality",
      body: [
        "We'll keep your non-public business information confidential and use it only to work on your requests. This doesn't apply to information that's already public or that we're required by law to disclose.",
      ],
    },
    {
      heading: "Intro calls and the ask box",
      body: [
        "Intro calls are free, last about 15 minutes and are scheduled through Cal.com. Booking a call doesn't commit you to anything.",
        "The ask box on our site uses AI to answer common questions. Its answers are for general information and may occasionally be wrong; these terms and what we confirm with you directly take precedence.",
      ],
    },
    {
      heading: "Acceptable use",
      body: [
        "Please don't misuse the site or the service. That includes trying to break or overload the site, accessing it in unauthorised ways, using it to break the law, or harassing our team. We may suspend or end the service for serious or repeated misuse.",
      ],
    },
    {
      heading: "Ending the service",
      body: [
        "You can cancel as described above. We may also end or suspend your subscription if you materially breach these terms, if payment fails and isn't resolved, or if we stop offering the service. If we end the service for reasons other than your breach, we'll refund the unused part of your current billing period.",
      ],
    },
    {
      heading: "Disclaimers",
      body: [
        'We take care with every request, but the service is provided "as is". To the extent allowed by law, we don\'t make any warranties beyond those in these terms, including that designs will achieve particular business results, be error-free, or be suitable for registration as a trademark. You\'re responsible for reviewing deliverables before you use them, including checking legal and trademark clearance.',
      ],
    },
    {
      heading: "Limitation of liability",
      body: [
        "To the extent allowed by law, Designjoy won't be liable for indirect, incidental, special or consequential damages, or for lost profits, revenue or data. Our total liability for any claim related to the service is limited to the amount you paid us in the three months before the claim.",
      ],
    },
    {
      heading: "Indemnity",
      body: [
        "If someone makes a claim against us because of materials you provided or how you used the deliverables, you agree to cover our reasonable costs of dealing with it, including legal fees.",
      ],
    },
    {
      heading: "Changes to these terms",
      body: [
        "We may update these terms from time to time. We'll post the new version here with a new date, and if the changes are significant we'll let current clients know by email before they take effect. Continuing your subscription after that means you accept the updated terms.",
      ],
    },
    {
      heading: "Governing law",
      body: [
        `These terms are governed by the laws of the State of ${state}, United States, without regard to its conflict of law rules. Any dispute will be handled in the courts located in ${state}, unless the law where you live says otherwise.`,
      ],
    },
    {
      heading: "Contact",
      body: [`Questions about these terms? Email ${email}.`],
    },
  ],
};
