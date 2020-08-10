import React from 'react'

const availableEnv = {
  __DEV__,
  NODE_ENV: process.env.NODE_ENV,
  SSR_CLIENT_: process.env.SSR_CLIENT_KEY
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
                <span key={key}>{key}</span>
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
