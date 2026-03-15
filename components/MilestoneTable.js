import { formatShort } from '../lib/finance';

export default function MilestoneTable({ milestones }) {
  if (!milestones?.length) return null;
  return (
    <div style={{ overflowX: 'auto' }} role="region" aria-label="Investment milestone table">
      <table className="breakdown-table" aria-label="Year-by-year investment milestones">
        <thead>
          <tr>
            <th scope="col">Year</th>
            <th scope="col" style={{ textAlign: 'right' }}>Amount Invested</th>
            <th scope="col" style={{ textAlign: 'right' }}>Projected Corpus</th>
            <th scope="col" style={{ textAlign: 'right' }}>Estimated Gains</th>
          </tr>
        </thead>
        <tbody>
          {milestones.map((m) => {
            const gainPct = m.invested > 0
              ? ((m.growth / m.invested) * 100).toFixed(1)
              : 0;
            return (
              <tr key={m.year}>
                <td>
                  <span className="yr-badge" aria-label={`Year ${m.year}`}>
                    Yr {m.year}
                  </span>
                </td>
                <td aria-label={`Amount invested at year ${m.year}: ${formatShort(m.invested)}`}>
                  {formatShort(m.invested)}
                </td>
                <td aria-label={`Projected corpus at year ${m.year}: ${formatShort(m.corpus)}`}>
                  {formatShort(m.corpus)}
                </td>
                <td aria-label={`Estimated gains at year ${m.year}: ${formatShort(m.growth)}, ${gainPct} percent gain`}>
                  {formatShort(m.growth)}
                  <span style={{ fontSize: '.7rem', color: '#919090', marginLeft: 5 }} aria-hidden="true">
                    +{gainPct}%
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}