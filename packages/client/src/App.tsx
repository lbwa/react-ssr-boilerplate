import React from 'react'

import './app.css'

const availableEnv = {
  __DEV__,
  'process.env.NODE_ENV': process.env.NODE_ENV,
  'process.env.SSR_APP_*': process.env.SSR_APP_KEY
}

const App: React.FC = () => {
  return (
    <>
      <h1>react.js ssr boilerplate</h1>
      <section onClick={() => console.log(`clicked !`)}>
        <h3>available global env variables</h3>
        <ul>
          {(Object.keys(availableEnv) as (keyof typeof availableEnv)[]).map(
            (key) => (
              <li>
                <span key={key}>{key}</span>:&nbsp;
                <span>{JSON.stringify(availableEnv[key])}</span>
              </li>
            )
          )}
        </ul>
      </section>
      <footer>
        Created&nbsp;by&nbsp;
        <a
          href="https://github.com/lbwa"
          target="_blank"
          rel="noopener noreferrer"
        >
          Bowen Liu
        </a>
      </footer>
    </>
  )
}

export default App
