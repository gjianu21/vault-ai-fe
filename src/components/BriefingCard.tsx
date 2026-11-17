import { capitalize, nameInitials } from '../format';
import type { BriefingSignal, CustomerBriefing } from '../types';
import { Icon, type IconName } from './Icon';
import { SourceChip } from './SourceChip';

interface Props {
    briefing: CustomerBriefing;
}

export function BriefingCard({ briefing }: Props) {
    const { customer, nextMeeting, products, signals, nextBestAction } = briefing;
    const important = signals.filter((signal) => signal.severity !== 'LOW');

    return (
        <article className="briefing-card reveal">
            <header className="briefing-head">
                <div className="avatar large">{nameInitials(customer.name)}</div>
                <div className="briefing-head-text">
                    <strong>{nextMeeting ? `Meeting with ${customer.name}` : customer.name}</strong>
                    <span className="muted small">
                        {nextMeeting ? (
                            <>
                                {capitalize(nextMeeting.when)}, {nextMeeting.time} · {nextMeeting.topic}{' '}
                                <SourceChip id={nextMeeting.id} />
                            </>
                        ) : (
                            `${customer.segment} · customer for ${customer.customerSinceYears} years`
                        )}
                    </span>
                </div>
                {important.length > 0 && (
                    <span className="signal-count">
                        {important.length} {important.length === 1 ? 'signal' : 'signals'}
                    </span>
                )}
            </header>

            <div className="briefing-body">
                {products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <div key={product.id} className={product.highlight ? 'product-tile highlight' : 'product-tile'}>
                                <span className="product-name">{product.name}</span>
                                <span className="product-amount">{product.amountLabel}</span>
                                <span className="product-foot">
                                    <SourceChip id={product.id} />
                                    {product.detail && <span className="product-detail">{product.detail}</span>}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {important.length > 0 && (
                    <div className="briefing-section">
                        <div className="section-label">What needs your attention</div>
                        {important.map((signal) => (
                            <SignalRow key={signal.text} signal={signal} />
                        ))}
                    </div>
                )}

                {nextBestAction && (
                    <div className="next-action">
                        <span className="next-action-icon">
                            <Icon name="sparkle" size={16} filled />
                        </span>
                        <div>
                            <div className="next-action-label">Next best action</div>
                            <p>{nextBestAction}</p>
                        </div>
                    </div>
                )}
            </div>
        </article>
    );
}

function SignalRow({ signal }: { signal: BriefingSignal }) {
    const icon: IconName = signal.severity === 'HIGH' ? 'alert' : 'clock';
    return (
        <div className="signal-row">
            <span className={`signal-icon ${signal.severity.toLowerCase()}`}>
                <Icon name={icon} size={15} />
            </span>
            <span className="signal-text">
                {signal.text}{' '}
                {signal.sourceIds.map((id) => (
                    <SourceChip key={id} id={id} />
                ))}
            </span>
        </div>
    );
}