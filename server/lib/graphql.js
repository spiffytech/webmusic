const {SubscriptionClient} = require('subscriptions-transport-ws');

function subscribe(client, query, onData, onError=console.error) {
    client.request(query).subscribe({next: onData, error: onError});
}

function query(client, query) {
    return new Promise((resolve, reject) => {
      client.request(query).subscribe({
        next: (result) => {
          if (result.errors) return reject(result.errors);
          resolve(result);
        },
        error: reject
      });
    })
}

module.exports.mkClient = function mkClient(url, options, ws=undefined) {
    const client = new SubscriptionClient(url, options, ws);
    client.on('error', error => { throw error})
    return {
        client,
        subscribe: subscribe.bind(null, client),
        query: query.bind(null, client)
    };
}
