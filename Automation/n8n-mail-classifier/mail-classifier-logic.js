// ============================================================
// MAIL CLASSIFIER LOGIC
// Reference implementation for a mailbox classifier workflow.
//
// Design goals:
// - normalize sender, subject, snippet, and body text
// - weight sender and header matches more than long-body matches
// - let explicit high-confidence rules win before fallback scoring
// - keep account-label support alongside primary category labels
// - compute removeLabels so stale categories can be cleaned up
// ============================================================

const rawFrom = String($json.From || "");
const rawTo = String($json.To || "");
const rawSubject = String($json.Subject || "");
const rawSnippet = String($json.snippet || "");
const rawBody = String($json.body || $json.text || $json.textPlain || "");
const labelMap = $json.labelMap || {};
const canonicalLabelMap = Object.create(null);
const regexCache = new Map();

const LABELS = {
  accountPrimary: "[account-primary]",
  accountSecondary: "[account-secondary]",
  accountWork: "[account-work]",
  accountArchive: "[account-archive]",
  review: "[review-needed]",
  socialA: "Mailbox/SocialA",
  socialB: "Mailbox/SocialB",
  financeA: "Mailbox/FinanceA",
  financeB: "Mailbox/FinanceB",
  security: "Category/Security",
  subscriptions: "Category/Subscriptions",
  offers: "Category/Offers",
  medical: "Category/Medical",
  invoices: "Category/Invoices",
  payments: "Category/Payments",
  transport: "Category/Transport",
  business: "Category/Business",
  orders: "Category/Orders",
  gaming: "Category/Gaming",
  finance: "Category/Finance",
  marketing: "Category/Marketing",
  jobs: "Category/Jobs"
};

function canonicalizeLabelKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9[\]/-]+/g, "");
}

for (const key of Object.keys(labelMap)) {
  const canonicalKey = canonicalizeLabelKey(key);
  if (canonicalKey && canonicalLabelMap[canonicalKey] === undefined) {
    canonicalLabelMap[canonicalKey] = labelMap[key];
  }
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9@.+/_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const normalizedTokenCache = Object.create(null);
const lowerTokenCache = Object.create(null);

function getNormalizedToken(value) {
  const key = String(value || "");
  if (normalizedTokenCache[key] === undefined) {
    normalizedTokenCache[key] = normalizeText(key);
  }
  return normalizedTokenCache[key];
}

function getLowerToken(value) {
  const key = String(value || "");
  if (lowerTokenCache[key] === undefined) {
    lowerTokenCache[key] = key.toLowerCase();
  }
  return lowerTokenCache[key];
}

function extractEmailAddress(value) {
  const text = String(value || "").toLowerCase();
  const angleMatch = text.match(/<([^>]+@[^>]+)>/);
  if (angleMatch) {
    return angleMatch[1].trim();
  }

  const emailMatch = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/);
  return emailMatch ? emailMatch[0].trim() : "";
}

function extractDomain(email) {
  const atIndex = email.lastIndexOf("@");
  return atIndex >= 0 ? email.slice(atIndex + 1) : "";
}

const fromEmail = extractEmailAddress(rawFrom);
const fromDomain = extractDomain(fromEmail);

const ctx = {
  fromEmail,
  fromDomain,
  fromText: normalizeText(rawFrom),
  toText: normalizeText(rawTo),
  subjectText: normalizeText(rawSubject),
  snippetText: normalizeText(rawSnippet),
  bodyText: normalizeText(rawBody)
};

ctx.headerText = [ctx.fromText, ctx.subjectText, ctx.snippetText].filter(Boolean).join(" ");
ctx.fullText = [ctx.fromText, ctx.subjectText, ctx.snippetText, ctx.bodyText].filter(Boolean).join(" ");

const labels = [];
let classified = false;
let cachedSubscriptionNotification;

function pickLabel() {
  for (let i = 0; i < arguments.length; i += 1) {
    const key = arguments[i];
    if (labelMap[key] !== undefined) {
      return labelMap[key];
    }

    const canonicalKey = canonicalizeLabelKey(key);
    if (canonicalLabelMap[canonicalKey] !== undefined) {
      return canonicalLabelMap[canonicalKey];
    }
  }

  return undefined;
}

function resolveLabelKeys(labelKeys) {
  return Array.isArray(labelKeys) ? pickLabel.apply(null, labelKeys) : pickLabel(labelKeys);
}

function pushResolvedLabel(labelKeys) {
  const resolved = resolveLabelKeys(labelKeys);
  if (resolved !== undefined) {
    labels.push(resolved);
    return true;
  }
  return false;
}

function applyPrimaryLabel(labelKeys) {
  if (pushResolvedLabel(labelKeys)) {
    classified = true;
  }
}

function patternToRegex(pattern) {
  if (pattern instanceof RegExp) {
    return pattern;
  }

  if (!regexCache.has(pattern)) {
    regexCache.set(pattern, new RegExp(pattern, "i"));
  }

  return regexCache.get(pattern);
}

function patternMatch(text, pattern) {
  if (!text) {
    return false;
  }
  return patternToRegex(pattern).test(text);
}

function weightedPatternScore(patterns, weights) {
  const fieldWeights = weights || {
    fromText: 6,
    subjectText: 5,
    snippetText: 3,
    bodyText: 1
  };

  let score = 0;

  for (const pattern of patterns) {
    let bestWeight = 0;
    for (const fieldName of Object.keys(fieldWeights)) {
      if (patternMatch(ctx[fieldName], pattern)) {
        bestWeight = Math.max(bestWeight, fieldWeights[fieldName]);
      }
    }
    score += bestWeight;
  }

  return score;
}

function senderContainsAny(tokens) {
  return tokens.some(token => {
    const normalizedToken = getNormalizedToken(token);
    const lowerToken = getLowerToken(token);
    return (
      ctx.fromText.includes(normalizedToken) ||
      fromEmail.includes(lowerToken) ||
      fromDomain.includes(lowerToken)
    );
  });
}

function senderEmailStartsWithAny(prefixes) {
  return prefixes.some(prefix => fromEmail.startsWith(String(prefix).toLowerCase()));
}

function domainMatches(candidate) {
  const normalized = String(candidate || "").toLowerCase().replace(/^@/, "");
  return Boolean(fromDomain) && (fromDomain === normalized || fromDomain.endsWith("." + normalized));
}

function domainMatchesAny(candidates) {
  return candidates.some(domainMatches);
}

function uniqueLabels(values) {
  return Array.from(new Set(values.filter(value => value !== undefined)));
}

function addScore(bucket, key, amount) {
  if (!amount || amount <= 0) {
    return;
  }
  bucket[key] = (bucket[key] || 0) + amount;
}

function getScore(bucket, key) {
  return bucket[key] || 0;
}

// ============================================================
// GENERALIZED PATTERN LIBRARY
// ============================================================

const SOCIAL_A_PATTERNS = [
  "social-a",
  "verify your email",
  "login alert",
  "security notice",
  "new device"
];

const SOCIAL_B_PATTERNS = [
  "social-b",
  "streaming-a",
  "password reset",
  "sign in",
  "account activity"
];

const FINANCE_A_PATTERNS = [
  "finance-a",
  "coverage update",
  "policy notice",
  "payment reminder",
  "billing notice"
];

const FINANCE_B_PATTERNS = [
  "finance-b",
  "trading summary",
  "portfolio update",
  "market notice",
  "account statement"
];

const SUBSCRIPTION_PATTERNS = [
  "subscription",
  "membership",
  "renewal",
  "billing period",
  "plan has ended",
  "next charge"
];

const SECURITY_PATTERNS = [
  "verification code",
  "password reset",
  "new device",
  "unusual activity",
  "2fa",
  "magic link",
  "login alert"
];

const INVOICE_PATTERNS = [
  "invoice",
  "billing statement",
  "amount due",
  "due date",
  "statement ready"
];

const PAYMENT_PATTERNS = [
  "payment received",
  "payment failed",
  "charged",
  "refund",
  "transaction"
];

const ORDER_PATTERNS = [
  "order confirmation",
  "tracking number",
  "delivery update",
  "receipt",
  "shipped"
];

const TRANSPORT_OPERATION_PATTERNS = [
  "trip receipt",
  "ride summary",
  "pickup",
  "dropoff",
  "fare"
];

const TRANSPORT_PROMO_PATTERNS = [
  "promo",
  "discount",
  "offer",
  "next rides",
  "open the app"
];

const BUSINESS_PATTERNS = [
  "accounting",
  "statement batch",
  "bookkeeping",
  "ledger",
  "business documents"
];

const MEDICAL_PATTERNS = [
  "clinic",
  "appointment",
  "treatment plan",
  "lab result",
  "diagnostic"
];

const JOB_PATTERNS = [
  "recruiter",
  "interview",
  "application status",
  "job alert",
  "career opportunity"
];

const OFFER_PATTERNS = [
  "voucher code",
  "discount code",
  "offer for you",
  "coupon",
  "promo code"
];

const GAMING_PATTERNS = [
  "game",
  "gaming",
  "dlc",
  "wishlist",
  "expansion"
];

const FINANCE_PATTERNS = [
  "portfolio",
  "trade",
  "brokerage",
  "market update",
  "coverage"
];

const MARKETING_PATTERNS = [
  "newsletter",
  "unsubscribe",
  "limited time",
  "sale",
  "shop now"
];

function isSocialAMail() {
  return senderContainsAny(["social-a"]) || domainMatchesAny(["social-a.example"]);
}

function isSocialBMail() {
  return senderContainsAny(["social-b", "streaming-a"]) || domainMatchesAny(["social-b.example"]);
}

function isFinanceAMail() {
  return senderContainsAny(["finance-a"]) || domainMatchesAny(["finance-a.example"]);
}

function isFinanceBMail() {
  return senderContainsAny(["finance-b"]) || domainMatchesAny(["finance-b.example"]);
}

function isBusinessMail() {
  return senderContainsAny(["business-ops", "accounting-provider"]) && weightedPatternScore(BUSINESS_PATTERNS) >= 4;
}

function isTransportPromoMail() {
  const isTransportSender = senderContainsAny(["ride-a", "ride-b", "transport-provider"]);
  return isTransportSender && weightedPatternScore(TRANSPORT_PROMO_PATTERNS) >= 5;
}

function isTransportOperationalMail() {
  const isTransportSender = senderContainsAny(["ride-a", "ride-b", "transport-provider"]);
  return isTransportSender && !isTransportPromoMail() && weightedPatternScore(TRANSPORT_OPERATION_PATTERNS) >= 5;
}

function isSubscriptionNotification() {
  if (cachedSubscriptionNotification !== undefined) {
    return cachedSubscriptionNotification;
  }

  const score = weightedPatternScore(SUBSCRIPTION_PATTERNS);
  cachedSubscriptionNotification =
    score >= 6 ||
    ((senderContainsAny(["subscription-provider", "membership-provider"]) || domainMatchesAny(["subscription.example"])) && score >= 4);
  return cachedSubscriptionNotification;
}

function isOfferMail() {
  const score = weightedPatternScore(OFFER_PATTERNS, {
    fromText: 6,
    subjectText: 6,
    snippetText: 4,
    bodyText: 1
  });

  const isSecurityish = patternMatch(ctx.headerText, /verification|otp|login|password|security/i);
  return score >= 5 && !isSecurityish;
}

// ============================================================
// ALWAYS-APPLIED ACCOUNT LABELS
// ============================================================

if (ctx.toText.includes("primary-account")) {
  pushResolvedLabel(LABELS.accountPrimary);
}

if (ctx.toText.includes("secondary-account")) {
  pushResolvedLabel(LABELS.accountSecondary);
}

if (ctx.toText.includes("work-account")) {
  pushResolvedLabel(LABELS.accountWork);
}

if (ctx.toText.includes("archive-account")) {
  pushResolvedLabel(LABELS.accountArchive);
}

// ============================================================
// PRIMARY RULES
// ============================================================

if (isSocialAMail()) {
  applyPrimaryLabel(weightedPatternScore(SECURITY_PATTERNS) >= 5 ? LABELS.security : LABELS.socialA);
}

if (!classified && isSocialBMail()) {
  applyPrimaryLabel(weightedPatternScore(SECURITY_PATTERNS) >= 5 ? LABELS.security : LABELS.socialB);
}

if (!classified && isFinanceAMail()) {
  applyPrimaryLabel(LABELS.financeA);
}

if (!classified && isFinanceBMail()) {
  applyPrimaryLabel(LABELS.financeB);
}

const primaryRules = [
  {
    name: "subscriptions",
    decide() {
      return isSubscriptionNotification() ? LABELS.subscriptions : null;
    }
  },
  {
    name: "business",
    decide() {
      return isBusinessMail() ? LABELS.business : null;
    }
  },
  {
    name: "transport",
    decide() {
      if (isTransportOperationalMail()) {
        return LABELS.transport;
      }
      if (isTransportPromoMail()) {
        return LABELS.marketing;
      }
      return null;
    }
  },
  {
    name: "offers",
    decide() {
      return isOfferMail() ? LABELS.offers : null;
    }
  },
  {
    name: "medical",
    decide() {
      return weightedPatternScore(MEDICAL_PATTERNS) >= 5 ? LABELS.medical : null;
    }
  },
  {
    name: "security",
    decide() {
      const score = weightedPatternScore(SECURITY_PATTERNS);
      const hasSenderHint = senderEmailStartsWithAny(["security@"]) || senderContainsAny(["account@", "auth-provider"]);
      return score >= 6 || (hasSenderHint && score >= 4) ? LABELS.security : null;
    }
  },
  {
    name: "invoices",
    decide() {
      return weightedPatternScore(INVOICE_PATTERNS) >= 5 ? LABELS.invoices : null;
    }
  },
  {
    name: "payments",
    decide() {
      return weightedPatternScore(PAYMENT_PATTERNS) >= 5 ? LABELS.payments : null;
    }
  },
  {
    name: "orders",
    decide() {
      return weightedPatternScore(ORDER_PATTERNS) >= 5 ? LABELS.orders : null;
    }
  },
  {
    name: "jobs",
    decide() {
      return weightedPatternScore(JOB_PATTERNS) >= 5 ? LABELS.jobs : null;
    }
  },
  {
    name: "gaming",
    decide() {
      return weightedPatternScore(GAMING_PATTERNS) >= 5 ? LABELS.gaming : null;
    }
  },
  {
    name: "finance",
    decide() {
      return weightedPatternScore(FINANCE_PATTERNS) >= 5 ? LABELS.finance : null;
    }
  },
  {
    name: "marketing",
    decide() {
      return weightedPatternScore(MARKETING_PATTERNS) >= 6 ? LABELS.marketing : null;
    }
  }
];

for (const rule of primaryRules) {
  if (classified) {
    break;
  }
  const labelKeys = rule.decide();
  if (labelKeys) {
    applyPrimaryLabel(labelKeys);
  }
}

function resolveFallbackLabel() {
  const scores = {
    providers: Object.create(null),
    intents: Object.create(null)
  };

  const subscriptionScore = weightedPatternScore(SUBSCRIPTION_PATTERNS);
  const securityScore = weightedPatternScore(SECURITY_PATTERNS);
  const invoiceScore = weightedPatternScore(INVOICE_PATTERNS);
  const paymentScore = weightedPatternScore(PAYMENT_PATTERNS);
  const orderScore = weightedPatternScore(ORDER_PATTERNS);
  const businessScore = weightedPatternScore(BUSINESS_PATTERNS);
  const marketingScore = weightedPatternScore(MARKETING_PATTERNS);
  const financeScore = weightedPatternScore(FINANCE_PATTERNS);
  const medicalScore = weightedPatternScore(MEDICAL_PATTERNS);
  const jobScore = weightedPatternScore(JOB_PATTERNS);
  const gamingScore = weightedPatternScore(GAMING_PATTERNS);
  const offerScore = weightedPatternScore(OFFER_PATTERNS);

  addScore(scores.providers, "socialA", isSocialAMail() ? 10 : 0);
  addScore(scores.providers, "socialB", isSocialBMail() ? 10 : 0);
  addScore(scores.providers, "financeA", isFinanceAMail() ? 10 : 0);
  addScore(scores.providers, "financeB", isFinanceBMail() ? 10 : 0);

  addScore(scores.intents, "subscription", subscriptionScore);
  addScore(scores.intents, "security", securityScore);
  addScore(scores.intents, "invoice", invoiceScore);
  addScore(scores.intents, "payment", paymentScore);
  addScore(scores.intents, "order", orderScore);
  addScore(scores.intents, "business", businessScore);
  addScore(scores.intents, "marketing", marketingScore);
  addScore(scores.intents, "finance", financeScore);
  addScore(scores.intents, "medical", medicalScore);
  addScore(scores.intents, "job", jobScore);
  addScore(scores.intents, "gaming", gamingScore);
  addScore(scores.intents, "offer", offerScore);

  if (getScore(scores.providers, "socialA") >= 8) {
    return getScore(scores.intents, "security") >= 6 ? LABELS.security : LABELS.socialA;
  }

  if (getScore(scores.providers, "socialB") >= 8) {
    return getScore(scores.intents, "security") >= 6 ? LABELS.security : LABELS.socialB;
  }

  if (getScore(scores.providers, "financeA") >= 8) {
    return LABELS.financeA;
  }

  if (getScore(scores.providers, "financeB") >= 8) {
    return LABELS.financeB;
  }

  if (getScore(scores.intents, "subscription") >= 8) {
    return LABELS.subscriptions;
  }

  if (getScore(scores.intents, "security") >= 8) {
    return LABELS.security;
  }

  if (getScore(scores.intents, "business") >= 8) {
    return LABELS.business;
  }

  if (isTransportOperationalMail()) {
    return LABELS.transport;
  }

  if (isTransportPromoMail()) {
    return LABELS.marketing;
  }

  if (getScore(scores.intents, "offer") >= 8) {
    return LABELS.offers;
  }

  if (getScore(scores.intents, "medical") >= 8) {
    return LABELS.medical;
  }

  if (getScore(scores.intents, "invoice") >= 8) {
    return LABELS.invoices;
  }

  if (getScore(scores.intents, "payment") >= 8) {
    return LABELS.payments;
  }

  if (getScore(scores.intents, "order") >= 8) {
    return LABELS.orders;
  }

  if (getScore(scores.intents, "job") >= 8) {
    return LABELS.jobs;
  }

  if (getScore(scores.intents, "gaming") >= 8) {
    return LABELS.gaming;
  }

  if (getScore(scores.intents, "finance") >= 8) {
    return LABELS.finance;
  }

  if (getScore(scores.intents, "marketing") >= 8) {
    return LABELS.marketing;
  }

  return null;
}

// ============================================================
// DEFAULT REVIEW STATE AND CLEANUP
// ============================================================

const accountLabels = [
  labelMap[LABELS.accountPrimary],
  labelMap[LABELS.accountSecondary],
  labelMap[LABELS.accountWork],
  labelMap[LABELS.accountArchive]
].filter(label => label !== undefined);

const reviewLabel = labelMap[LABELS.review];

const primaryCategoryLabels = uniqueLabels([
  resolveLabelKeys(LABELS.socialA),
  resolveLabelKeys(LABELS.socialB),
  resolveLabelKeys(LABELS.financeA),
  resolveLabelKeys(LABELS.financeB),
  resolveLabelKeys(LABELS.security),
  resolveLabelKeys(LABELS.subscriptions),
  resolveLabelKeys(LABELS.offers),
  resolveLabelKeys(LABELS.medical),
  resolveLabelKeys(LABELS.invoices),
  resolveLabelKeys(LABELS.payments),
  resolveLabelKeys(LABELS.transport),
  resolveLabelKeys(LABELS.business),
  resolveLabelKeys(LABELS.orders),
  resolveLabelKeys(LABELS.gaming),
  resolveLabelKeys(LABELS.finance),
  resolveLabelKeys(LABELS.marketing),
  resolveLabelKeys(LABELS.jobs)
]);

function hasOnlyAccountLabelsNow() {
  return labels.length > 0 && labels.every(label => accountLabels.includes(label));
}

if (!classified || hasOnlyAccountLabelsNow()) {
  pushResolvedLabel(resolveFallbackLabel());
}

const hasOnlyAccountLabels = hasOnlyAccountLabelsNow();

if (labels.length === 0 || hasOnlyAccountLabels) {
  if (reviewLabel !== undefined) {
    labels.length = 0;
    labels.push(reviewLabel);
  } else {
    pushResolvedLabel(LABELS.review);
  }
}

const cleanLabels = uniqueLabels(labels);
const realLabels = cleanLabels.filter(label => label !== reviewLabel);
const finalLabels = realLabels.length > 0 ? realLabels : cleanLabels;
const conflictingPrimaryLabelsToRemove =
  realLabels.length > 0 ? primaryCategoryLabels.filter(label => !finalLabels.includes(label)) : [];

const removeLabels = uniqueLabels([
  ...(reviewLabel !== undefined && realLabels.length > 0 ? [reviewLabel] : []),
  ...conflictingPrimaryLabelsToRemove
]).filter(label => !finalLabels.includes(label));

return {
  messageId: $json.id,
  labels: finalLabels,
  removeLabels,
  from: $json.From,
  subject: $json.Subject
};
