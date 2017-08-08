import React from "react"

import Chat from "./Chat"

class App extends React.Component {
  render() {
    return (
      <div>
        <p>{this.props.message}</p>
        <Chat />
      </div>
    )
  }
}

export default App
