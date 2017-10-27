import irc from 'irc'
import EventSource from 'eventsource'

let config = {
	channels: ["#openclonk", ],
	server: "irc.euirc.net",
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
    if (!data.flags.passwordNeeded && data.maxPlayers > 1) {
      bot.notice(
        config.channels[0],
        `Eine neue ${data.type === 'noleague' ? '': 'Liga-'}Runde ${data.title} beginnt. ${data.host} wartet auf dich! openclonk://league.openclonk.org:80/league.php?action=query&game_id=#${data.id}`
      )
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
