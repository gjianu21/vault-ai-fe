import { capitalize, nameInitials } from '../format';
import type { CustomerBriefing } from '../types';
import { SourceChip } from './SourceChip';

interface Props {
    briefing: CustomerBriefing;
}

export function CustomerPanel({ briefing }: Props) {
    const { customer, nextMeeting, timeline } = briefing;

    // every record the briefing is built from, counted per source system
    const ids = new Set<string>([
        customer.id,
        ...(nextMeeting ? [nextMeeting.id] : []),
        ...briefing.products.map((product) => product.id),
        ...briefing.signals.flatMap((signal) => signal.sourceIds),
        ...timeline.map((item) => item.id),
    ]);
    const count = (prefix: string) => [...ids].filter((id) => id.startsWith(prefix)).length;
    const sources = [
        { kind: 'CRM', label: 'Customer & meetings', count: count('CRM') },
        { kind: 'PRD', label: 'Product holdings', count: count('PRD') },
        { kind: 'CMP', label: 'Complaints', count: count('CMP') },
    ].filter((source) => source.count > 0);

    return (
        <aside className="customer-panel">
            <div className="section-label">Customer 360</div>

            <div className="profile-card">
                <div className="avatar xl">{nameInitials(customer.name)}</div>
                <strong className="profile-name">{customer.name}</strong>
                <span className="muted small">
                    {customer.age} · {customer.occupation} · {customer.city}
                </span>
                <div className="profile-tags">
                    <span className="tag accent">{customer.segment}</span>
                    <span className="tag">{customer.customerSinceYears} years</span>
                    <span className="tag">{customer.riskProfile} risk</span>
                </div>
            </div>

            {(nextMeeting || timeline.length > 0) && (
                <>
                    <div className="section-label">Timeline</div>
                    <div className="timeline">
                        {nextMeeting && (
                            <div className="timeline-item upcoming">
                                <span className="timeline-dot" />
                                <div>
                                    <strong>
                                        Meeting {nextMeeting.when}, {nextMeeting.time}
                                    </strong>
                                    <div className="muted">{nextMeeting.topic}</div>
                                </div>
                            </div>
                        )}
                        {timeline.map((item) => (
                            <div key={item.id} className="timeline-item">
                                <span className="timeline-dot" />
                                <div>
                                    <strong>
                                        {capitalize(item.when)} · {item.title}
                                    </strong>
                                    <div className="muted">{item.detail}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {sources.length > 0 && (
                <>
                    <div className="section-label">Sources behind this view</div>
                    <div className="sources-card">
                        {sources.map((source) => (
                            <div key={source.kind} className="source-row">
                                <span className="source-row-label">
                                    <SourceChip id={source.kind} />
                                    {source.label}
                                </span>
                                <span className="muted">
                                    {source.count} {source.count === 1 ? 'record' : 'records'}
                                </span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </aside>
    );
}