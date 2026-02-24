import { useMemo, useState } from 'react'
import './App.css'

const QUICK_PICK_ARTISTS = [
  'Playboi Carti',
  'Destroy Lonely',
  'Ken Carson',
  'Homixide Gang',
  'Yeat',
  'SoFaygo',
  'Cochise',
  'Lancey Foux',
  'Travis Scott',
  'Future',
  'Lil Uzi Vert',
  'Don Toliver',
  'Trippie Redd',
  'Lucki',
  'Young Thug',
  'Gunna',
  'Ski Mask The Slump God',
  'Pi’erre Bourne',
  'Yung Lean',
  'Bladee',
]

const SIMILAR = {
  'Playboi Carti': ['Ken Carson', 'Destroy Lonely', 'Homixide Gang', 'Yeat', 'Cochise', 'Lancey Foux'],
  'Destroy Lonely': ['Playboi Carti', 'Ken Carson', 'Homixide Gang', 'Lancey Foux', 'Lucki', 'Yeat'],
  'Ken Carson': ['Playboi Carti', 'Destroy Lonely', 'Homixide Gang', 'Yeat', 'SoFaygo', 'Cochise'],
  'Homixide Gang': ['Playboi Carti', 'Ken Carson', 'Destroy Lonely', 'Yeat', 'Lancey Foux'],
  Yeat: ['Ken Carson', 'Playboi Carti', 'SoFaygo', 'Trippie Redd', 'Lil Uzi Vert'],
  SoFaygo: ['Yeat', 'Ken Carson', 'Lil Uzi Vert', 'Trippie Redd', 'Cochise'],
  Cochise: ['Playboi Carti', 'Ken Carson', 'SoFaygo', 'Ski Mask The Slump God', 'Trippie Redd'],
  'Lancey Foux': ['Destroy Lonely', 'Playboi Carti', 'Homixide Gang', 'Yung Lean', 'Bladee'],
  'Travis Scott': ['Don Toliver', 'Future', 'Young Thug', 'Lil Uzi Vert', 'Gunna'],
  Future: ['Young Thug', 'Gunna', 'Travis Scott', 'Lil Uzi Vert', 'Don Toliver'],
  'Lil Uzi Vert': ['Trippie Redd', 'Future', 'Yeat', 'Travis Scott', 'Playboi Carti'],
  'Don Toliver': ['Travis Scott', 'Future', 'Young Thug', 'Gunna', 'Lil Uzi Vert'],
  'Trippie Redd': ['Lil Uzi Vert', 'Yeat', 'SoFaygo', 'Cochise', 'Playboi Carti'],
  Lucki: ['Destroy Lonely', 'Bladee', 'Yung Lean', 'Playboi Carti', 'Pi’erre Bourne'],
  'Young Thug': ['Future', 'Gunna', 'Travis Scott', 'Don Toliver', 'Lil Uzi Vert'],
  Gunna: ['Young Thug', 'Future', 'Don Toliver', 'Travis Scott', 'Lil Uzi Vert'],
  'Ski Mask The Slump God': ['Cochise', 'Trippie Redd', 'Lil Uzi Vert', 'Playboi Carti'],
  'Pi’erre Bourne': ['Playboi Carti', 'Lucki', 'Ken Carson', 'Destroy Lonely'],
  'Yung Lean': ['Bladee', 'Lancey Foux', 'Lucki', 'Playboi Carti'],
  Bladee: ['Yung Lean', 'Lucki', 'Lancey Foux', 'Destroy Lonely'],
}

function App() {
  const [pick1, setPick1] = useState('')
  const [pick2, setPick2] = useState('')
  const [pick3, setPick3] = useState('')

  const selected = useMemo(
    () => [pick1, pick2, pick3].filter(Boolean).filter((v, i, arr) => arr.indexOf(v) === i),
    [pick1, pick2, pick3],
  )

  const recommendations = useMemo(() => {
    const score = new Map()
    const reasons = new Map()

    selected.forEach((artist) => {
      ;(SIMILAR[artist] || []).forEach((candidate) => {
        if (selected.includes(candidate)) return
        score.set(candidate, (score.get(candidate) || 0) + 1)
        const prev = reasons.get(candidate) || []
        reasons.set(candidate, [...prev, artist])
      })
    })

    return [...score.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([name, match]) => ({
        name,
        match,
        why:
          (reasons.get(name) || []).length >= 2
            ? `Similar to ${reasons.get(name).slice(0, 2).join(' and ')}.`
            : `Similar to ${(reasons.get(name) || [])[0]}.`,
        link: `https://music.apple.com/us/search?term=${encodeURIComponent(name)}`,
      }))
  }, [selected])

  return (
    <div className="app">
      <h1>Artist Recommender</h1>
      <p>Use up to 3 quick picks, then get similar artists with music links.</p>

      <section className="panel">
        <h2>Choose up to 3 artists</h2>
        <div className="quickPickGrid">
          {[
            { label: 'Pick 1', value: pick1, set: setPick1 },
            { label: 'Pick 2', value: pick2, set: setPick2 },
            { label: 'Pick 3', value: pick3, set: setPick3 },
          ].map((slot) => (
            <label key={slot.label}>
              {slot.label}
              <select value={slot.value} onChange={(e) => slot.set(e.target.value)}>
                <option value="">None</option>
                {QUICK_PICK_ARTISTS.map((artist) => (
                  <option key={artist} value={artist}>
                    {artist}
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Recommendations</h2>
        {selected.length === 0 ? (
          <p>Select at least one artist.</p>
        ) : (
          <ul className="recommendations">
            {recommendations.map((artist, idx) => (
              <li key={artist.name}>
                <div>
                  <strong>
                    #{idx + 1} {artist.name}
                  </strong>
                  <p>{artist.why}</p>
                </div>
                <div className="actions">
                  <span className="score">Match {artist.match}</span>
                  <a href={artist.link} target="_blank" rel="noreferrer">
                    Open music ↗
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

export default App
