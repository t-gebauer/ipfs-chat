console.log("Running script 'app.js'.")

import IPFS from "ipfs"
import Room from "ipfs-pubsub-room"

const ipfs = new IPFS({
  repo: repo(),
  EXPERIMENTAL: {
    pubsub: true
  }
})

function repo() {
  // random repo path -> multiple ipfs nodes in the same browser
  return "ipfs/ipfs-chat/" + Math.random()
}

var id = undefined

ipfs.once("ready", () => ipfs.id((err, info) => {
  if (err) { throw err }
  id = info.id
  chat.addMessage({type: "system", data: "IPFS node ready with address " + info.id})
}))

ipfs.on("error", (err) => chat.addMessage({type: "error", data: "Error: " + err}))

const room = Room(ipfs, "ipfs-chat-room")

room.on("peer joined", (peer) =>
  chat.addMessage({type: "system", data: "Peer " + formatName(peer) + " joined."}))
room.on("peer left", (peer) =>
  chat.addMessage({type: "system", data: "Peer " + formatName(peer) + " left."})) 
room.on("message", (message) =>
  chat.addMessage({type: "chat", name: formatName(message.from), data: message.data}))

var knownIds = []
function formatName(name) {
  if (!name) { return "" }
  var index = knownIds.indexOf(name)
  if (index == -1) { index = knownIds.push(name) - 1 }
  if (name == id) { index = "me" }
  return index + "-[" + name.slice(-8) + "]"
}

import ChatBox from "./chat-box.js"

const chat = new ChatBox("chat_box")
chat.setMessageListener((message) => room.broadcast(message))
