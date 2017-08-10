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

ipfs.once("ready", () => ipfs.id((err, info) => {
  if (err) { throw err }
  peerInfo[info.id] = {id: info.id, number: 0, name: myName}
  chat.addMessage({type: "system", data: "IPFS node ready with address " + info.id})
}))

ipfs.on("error", (err) => chat.addMessage({type: "error", data: "Error: " + err}))

const room = Room(ipfs, "ipfs-chat-room")

room.on("peer joined", (peer) => {
  if (myName) {
    room.sendTo(peer, JSON.stringify({name: myName}))
  }
  chat.addMessage({type: "system", data: "Peer " + formatName(peer) + " joined."})
})

room.on("peer left", (peer) =>
  chat.addMessage({type: "system", data: "Peer " + formatName(peer) + " left."})) 

room.on("message", (message) => {
  try {
    // interpret data as JSON
    let data = JSON.parse(message.data)
    if (data.msg) {
      chat.addMessage({type: "chat", name: formatName(message.from), data: data.msg})
    } else if (data.name) {
      let info = getInfo(message.from)
      chat.addMessage({
        type: "system",
        name: formatName(info.id),
        data: "is now known as [" + data.name + "]."
      })
      info.name = data.name
    }
  } catch(err) {
    if (err.name == "SyntaxError") {
      // JSON.parse() failed
      console.log("Error: not JSON: " + message.data)
    } else {
      throw err
    }
  }
})

var myName = "" + Math.random()
var counter = 0
var peerInfo = {}

function getInfo(id) {
  var info = peerInfo[id]
  if (!info) {
    info = peerInfo[id] = {id: id, number: ++counter}
  }
  return info
}

function formatName(id) {
  if (!id) { return "" }
  let info = getInfo(id)
  return "[" + info.number + (info.name ? ":" + info.name : "") + "]"
}

import ChatBox from "./chat-box.js"

const chat = new ChatBox("chat_box")
chat.setMessageListener((message) => room.broadcast(JSON.stringify({msg: message})))
