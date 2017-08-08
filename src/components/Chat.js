import React from "react"

class Chat extends React.Component {
  render() {
    return (
      <div>
        <textarea className="chat_text" />
        <input className="chat_input" />
      </div>
    )
  }
}

export default Chat
