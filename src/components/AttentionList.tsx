import type { AttentionBriefing } from '../types';
import { SourceChip } from './SourceChip';

interface Props {
    briefing: AttentionBriefing;
}

export function AttentionList({ briefing }: Props) {
    if (briefing.items.length === 0) {
        return null;
    }

    return (
        <div className="attention-list reveal">
            {briefing.items.map((item, index) => (
                <article key={item.customerId} className="attention-item">
                    <span className="attention-rank">{index + 1}</span>
                    <div className="attention-body">
                        <div className="attention-title">
                            <strong>{item.customerName}</strong>
                            <span className={`severity ${item.severity.toLowerCase()}`}>
                                {item.severity === 'HIGH' ? 'High' : item.severity === 'MEDIUM' ? 'Medium' : 'Low'}
                            </span>
                            <span className="muted small attention-meeting">
                                {item.meeting ? `Meeting ${item.meeting.when}, ${item.meeting.time}` : 'No meeting this week'}
                            </span>
                        </div>
                        <ul className="attention-reasons">
                            {item.reasons.map((reason) => (
                                <li key={reason.text}>
                                    {reason.text}{' '}
                                    {reason.sourceIds.map((id) => (
                                        <SourceChip key={id} id={id} />
                                    ))}
                                </li>
                            ))}
                        </ul>
                        <p className="attention-recommendation">{item.recommendation}</p>
                    </div>
                </article>
            ))}
        </div>
    );
}