import React from 'react';
import { PILLAR_KEYS } from '../../engine/scoring';
import { getPillarFriendlyName } from '../../data/scoreTemplates';

const PrintSummary = React.memo(function PrintSummary({ results, ageBand }) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div
      className="print-only"
      style={{
        padding: 40,
        fontFamily: "'DM Sans', sans-serif",
        color: '#2C3E35',
        maxWidth: 700,
        margin: '0 auto',
      }}
    >
      <div style={{ borderBottom: '2px solid #4A7C6F', paddingBottom: 16, marginBottom: 24 }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#4A7C6F', margin: 0 }}>
          Khael Developmental Activity
        </h1>
        <p style={{ fontSize: '0.9rem', color: '#6B7F78', margin: '4px 0 0' }}>
          Summary for Healthcare Provider
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24, fontSize: '0.9rem' }}>
        <div><strong>Date:</strong> {today}</div>
        <div><strong>Age Band:</strong> {ageBand} years</div>
        <div><strong>Overall Score (CCI):</strong> {results.cci}/100</div>
        <div><strong>Profile:</strong> {results.profileLabel}</div>
        <div><strong>Consistency:</strong> {Math.round(results.consistency * 100)}%</div>
        <div><strong>Reliability:</strong> {results.lowReliability ? 'Low — interpret with caution' : 'Adequate'}</div>
      </div>

      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: '#4A7C6F', marginBottom: 12 }}>
        Pillar Scores
      </h2>

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', marginBottom: 24 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #B8D4C8' }}>
            <th style={{ textAlign: 'left', padding: '8px 0' }}>Domain</th>
            <th style={{ textAlign: 'center', padding: '8px 0' }}>Score</th>
            <th style={{ textAlign: 'center', padding: '8px 0' }}>Band</th>
            <th style={{ textAlign: 'center', padding: '8px 0' }}>Notes</th>
          </tr>
        </thead>
        <tbody>
          {PILLAR_KEYS.map((key) => {
            const pillar = results.pillars[key];
            if (!pillar) return null;
            const band = pillar.score >= 70 ? 'Strong' : pillar.score >= 45 ? 'Typical' : pillar.score >= 25 ? 'Emerging' : 'Needs Support';
            return (
              <tr key={key} style={{ borderBottom: '1px solid #E8E4DC' }}>
                <td style={{ padding: '8px 0' }}>{getPillarFriendlyName(key)}</td>
                <td style={{ textAlign: 'center', padding: '8px 0' }}>{pillar.score}</td>
                <td style={{ textAlign: 'center', padding: '8px 0' }}>{band}</td>
                <td style={{ textAlign: 'center', padding: '8px 0', fontSize: '0.8rem', color: '#6B7F78' }}>
                  {pillar.excludeFromCCI ? 'Excluded (known condition)' :
                   pillar.engagementFatigued ? 'Fatigue noted' : '—'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {results.weakPillars.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1rem', color: '#D4956A', marginBottom: 8 }}>
            Areas Flagged
          </h3>
          <p style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>
            The following domains scored below expected range: {results.weakPillars.map((k) => getPillarFriendlyName(k)).join(', ')}.
          </p>
        </div>
      )}

      <div style={{ borderTop: '1px solid #E8E4DC', paddingTop: 16, marginTop: 24, fontSize: '0.8rem', color: '#6B7F78', lineHeight: 1.5 }}>
        <strong>Disclaimer:</strong> This is not a clinical assessment. It is a structured observational activity
        completed at home in a browser-based format. Results should be interpreted as a screening-level starting
        point only. A comprehensive developmental evaluation by qualified professionals is recommended for any
        clinical decision-making.
        <br /><br />
        <em>Khael — A developmental starting point, not a diagnosis</em>
      </div>
    </div>
  );
});

export default PrintSummary;
