import irc from 'irc'
import EventSource from 'eventsource'

let config = {
	channels: ["#openclonk", ],
	server: "irc.hes.de.euirc.net",
	botName: "NativeBot"
}
let es = null
let bot = new irc.Client(config.server, config.botName, {
	channels: config.channels
})

bot.addListener('error', function(message) {
    console.log('IRC error: ', message);
});


function handleCreate(e) {
  console.log({handleCreate: e.data})
  if (e.data) {
    let data = JSON.parse(e.data)
    if (data.flags.joinAllowed && !data.flags.passwordNeeded && data.maxPlayers > 1) {
      bot.say(config.channels[0], `${data.host} just opened a round of ${data.title}. Join now!`)
    }
  }
}

function connectEventSource() {
  if (es && es.readyState === es.OPEN) {
    console.log('closing old connection')
    es.close()
  }

  console.log('connecting to game events...')
  es = new EventSource('http://league.openclonk.org/poll_game_events.php')
  es.addEventListener('create', handleCreate)
  es.onerror = function (err) {
    if (es.readyState !== es.CONNECTING) {
      console.log({error: err, readyState: es.readyState})
      console.log('Reconnecting')
      setTimeout(connectEventSource, 2000)
    }
  }
  es.onclose = (e) => {
    console.log({closed: e})
    connectEventSource()
  }
}

connectEventSource()
console.log('Startup complete')
