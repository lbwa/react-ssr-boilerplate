import React from 'react'

const App: React.FC = () => {
  return (
    <>
      <h1>react.js ssr boilerplate</h1>
      <section onClick={() => console.log(`clicked !`)}>
        <h3>available global env variables</h3>
        <ul>
          <li>
            <label>__DEV__</label>
            <span>{JSON.stringify(__DEV__)}</span>
          </li>
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
