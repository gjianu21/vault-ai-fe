import type { AttentionBriefing, ChatResponse, CustomerBriefing } from '../types';

/** Set to false when the backend sends `briefing` and `followUps` itself. */
const MOCK_STORAGE_KEY = 'vault-ai-mock-briefings';

/**
 * Where the card data comes from:
 * 1. ?mock=on / ?mock=off in the URL (remembered in this browser), for switching live during a demo
 * 2. otherwise VITE_USE_MOCK_BRIEFINGS from .env.local (default: true)
 */
function readMockFlag(): boolean {
    const fromUrl = new URLSearchParams(window.location.search).get('mock');
    try {
        if (fromUrl === 'on' || fromUrl === 'off') {
            localStorage.setItem(MOCK_STORAGE_KEY, fromUrl);
        }
        const remembered = localStorage.getItem(MOCK_STORAGE_KEY);
        if (remembered === 'on' || remembered === 'off') {
            return remembered === 'on';
        }
    } catch {
        // storage not available: fall back to the env variable
    }
    return import.meta.env.VITE_USE_MOCK_BRIEFINGS !== 'false';
}

/** True: card data from this file. False: only what the backend sends in `briefing` and `followUps`. */
export const USE_MOCK_BRIEFINGS = readMockFlag();

console.info(`[vault-ai] Card data: ${USE_MOCK_BRIEFINGS ? 'MOCK (front-end)' : 'BACKEND'}`);


const MAX_BRIEFING: CustomerBriefing = {
    kind: 'CUSTOMER',
    customer: {
        id: 'CRM-C001',
        name: 'Max Müller',
        age: 54,
        occupation: 'Mechanical engineer',
        city: 'Frankfurt',
        segment: 'Premium',
        customerSinceYears: 18,
        riskProfile: 'Moderate',
    },
    nextMeeting: { id: 'CRM-MTG-0001', when: 'today', time: '10:00', topic: 'Annual portfolio review' },
    products: [
        { id: 'PRD-0001', name: 'Current account', amountLabel: 'EUR 12,400', detail: null, highlight: false },
        { id: 'PRD-0002', name: 'Fixed-term deposit', amountLabel: 'EUR 50,000', detail: 'matures in 30 days', highlight: true },
        { id: 'PRD-0003', name: 'Gold credit card', amountLabel: '13% used', detail: null, highlight: false },
    ],
    signals: [
        { severity: 'MEDIUM', text: 'EUR 50,000 deposit matures in 30 days, a reinvestment window.', sourceIds: ['PRD-0002'] },
        { severity: 'MEDIUM', text: 'Card complaint resolved 6 days ago: the double foreign fee was refunded.', sourceIds: ['CMP-0001'] },
        { severity: 'LOW', text: 'Customer for 18 years.', sourceIds: ['CRM-C001'] },
    ],
    nextBestAction:
        'Open by checking his satisfaction with the complaint resolution, then discuss reinvestment options for the maturing deposit.',
    timeline: [
        { id: 'CRM-INT-0102', when: '6 days ago', title: 'Email', detail: 'Informed that the complaint was resolved' },
        { id: 'CRM-INT-0101', when: '45 days ago', title: 'Phone', detail: 'Asked about the deposit maturity' },
    ],
};

const ATTENTION_BRIEFING: AttentionBriefing = {
    kind: 'ATTENTION',
    items: [
        {
            customerId: 'CRM-C005',
            customerName: 'Jonas Becker',
            severity: 'HIGH',
            reasons: [
                { severity: 'HIGH', text: 'Current account overdrawn by EUR 640', sourceIds: ['PRD-0011'] },
                { severity: 'HIGH', text: 'Credit card at 92% of its limit', sourceIds: ['PRD-0012'] },
            ],
            meeting: { id: 'CRM-MTG-0005', when: 'in 6 days', time: '16:00', topic: 'Account review' },
            recommendation: 'Offer a budgeting conversation before discussing a higher card limit.',
        },
        {
            customerId: 'CRM-C003',
            customerName: 'Lukas Weber',
            severity: 'HIGH',
            reasons: [{ severity: 'HIGH', text: 'Fees complaint open for 12 days', sourceIds: ['CMP-0002'] }],
            meeting: { id: 'CRM-MTG-0003', when: 'in 4 days', time: '11:30', topic: 'Business loan review' },
            recommendation: 'Give him an update on the complaint before the meeting.',
        },
        {
            customerId: 'CRM-C004',
            customerName: 'Sofia Rossi',
            severity: 'HIGH',
            reasons: [{ severity: 'HIGH', text: 'EUR 120,000 deposit matures in 7 days', sourceIds: ['PRD-0009'] }],
            meeting: null,
            recommendation: 'Call her this week to discuss low-risk reinvestment options.',
        },
        {
            customerId: 'CRM-C001',
            customerName: 'Max Müller',
            severity: 'MEDIUM',
            reasons: [
                { severity: 'MEDIUM', text: 'Card complaint resolved 6 days ago', sourceIds: ['CMP-0001'] },
                { severity: 'MEDIUM', text: 'EUR 50,000 deposit matures in 30 days', sourceIds: ['PRD-0002'] },
            ],
            meeting: { id: 'CRM-MTG-0001', when: 'today', time: '10:00', topic: 'Annual portfolio review' },
            recommendation: 'Check his satisfaction with the complaint resolution.',
        },
    ],
};

const MAX_SUMMARY =
    'Your next meeting is with Max Müller today at 10:00. He has been a customer for 18 years and holds three products. ' +
    'Two things stand out: a card complaint that was resolved last week and a deposit that matures in 30 days.';

const ATTENTION_SUMMARY =
    'Four customers need your attention this week. Jonas Becker and Lukas Weber are the most urgent, ' +
    'and Sofia Rossi has a large deposit maturing without a meeting scheduled.';

/** Adds the card data the backend does not send yet. The short summary replaces the long mock text. */
export function applyMockBriefing(message: string, response: ChatResponse): ChatResponse {
    if (!USE_MOCK_BRIEFINGS || response.briefing) {
        return response;
    }
    const text = message.toLowerCase();

    if (text.includes('talking point')) {
        return { ...response, followUps: ['Investment options'] };
    }
    if (text.includes('invest') || text.includes('options')) {
        return { ...response, followUps: ['Prepare talking points'] };
    }
    if (text.includes('attention') || text.includes('this week')) {
        return {
            ...response,
            reply: ATTENTION_SUMMARY,
            briefing: ATTENTION_BRIEFING,
            followUps: ['Prepare me for my next customer meeting'],
        };
    }
    if (text.includes('next meeting') || text.includes('next customer') || text.includes('prepare me')) {
        return {
            ...response,
            reply: MAX_SUMMARY,
            briefing: MAX_BRIEFING,
            followUps: ['Prepare talking points', 'Investment options'],
        };
    }
    return response;
}