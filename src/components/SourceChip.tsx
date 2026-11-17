interface Props {
    id: string;
}

/** CRM-... blue, PRD-... violet, CMP-... orange: you see the source system at a glance. */
export function SourceChip({ id }: Props) {
    const kind = id.startsWith('CRM') ? 'crm' : id.startsWith('PRD') ? 'prd' : id.startsWith('CMP') ? 'cmp' : 'other';
    return <span className={`src src-${kind}`}>{id}</span>;
}