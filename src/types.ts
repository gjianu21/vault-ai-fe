export interface Me {
    id: string;
    email: string;
    roles: string[];
}

export type ReplySource = 'AI' | 'MOCK' | 'RULES' | 'FALLBACK';

export interface Conversation {
    id: string;
    title: string;
    saved: boolean;
    closed: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ChatMessageDto {
    id: string;
    role: 'USER' | 'ASSISTANT';
    content: string;
    createdAt: string;
}

// ---------- Briefing: structured data for the cards (contract with the backend) ----------

export type SignalSeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export interface BriefingCustomer {
    id: string;
    name: string;
    age: number;
    occupation: string;
    city: string;
    segment: string;
    customerSinceYears: number;
    riskProfile: string;
}

export interface BriefingMeeting {
    id: string;
    /** Already formatted by the backend: "today", "tomorrow", "in 4 days" */
    when: string;
    time: string;
    topic: string;
}

export interface BriefingProduct {
    id: string;
    name: string;
    /** Already formatted: "EUR 50,000", "13% used" */
    amountLabel: string;
    /** Short extra line: "matures in 30 days", "2.8% interest"; null when there is nothing to add */
    detail: string | null;
    /** True when a signal is about this product (drawn with an orange border) */
    highlight: boolean;
}

export interface BriefingSignal {
    severity: SignalSeverity;
    text: string;
    sourceIds: string[];
}

export interface BriefingTimelineItem {
    id: string;
    when: string;
    title: string;
    detail: string;
}

export interface CustomerBriefing {
    kind: 'CUSTOMER';
    customer: BriefingCustomer;
    nextMeeting: BriefingMeeting | null;
    products: BriefingProduct[];
    signals: BriefingSignal[];
    nextBestAction: string | null;
    timeline: BriefingTimelineItem[];
}

export interface AttentionItem {
    customerId: string;
    customerName: string;
    severity: SignalSeverity;
    reasons: BriefingSignal[];
    meeting: BriefingMeeting | null;
    recommendation: string;
}

export interface AttentionBriefing {
    kind: 'ATTENTION';
    items: AttentionItem[];
}

export type Briefing = CustomerBriefing | AttentionBriefing;

// ---------- Chat ----------

export interface ChatResponse {
    conversationId: string;
    reply: string;
    promptId: string | null;
    source: ReplySource;
    citedSources: string[];
    briefing?: Briefing | null;
    followUps?: string[];
}

export interface ChatEntry {
    id: string;
    role: 'user' | 'assistant' | 'error';
    content: string;
    createdAt: string;
    source?: ReplySource;
    citedSources?: string[];
    briefing?: Briefing | null;
    followUps?: string[];
    animate?: boolean;
}