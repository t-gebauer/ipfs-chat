console.log("Running script 'app.js'.")

import IPFS from "ipfs"
import Room from "ipfs-pubsub-room"

const ipfs = new IPFS({
	repo: repo(),
	EXPERIMENTAL: {
		pubsub: true
	}
})

ipfs.once("ready", () => ipfs.id((err, info) => {
	if (err) { throw err }
	console.log("IPFS node ready with address " + info.id)
}))

const room = Room(ipfs, "ipfs-chat-room")

room.on("peer joined", (peer) => console.log("peer " + peer + " joined"))
room.on("peer left", (peer) => console.log("peer " + peer + " left"))

function repo() {
	return "ipfs/ipfs-chat/" + Math.random()
}

import ReactDOM from "react-dom"
import React from "react"

import App from "./components/App"

ReactDOM.render(
  <App />,
  document.getElementById("root")
)
