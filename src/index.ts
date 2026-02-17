// console.log("Hello via Bun!");

// const interval = setInterval(() => {
//   console.log("Hello again!");
// }, 1000);

// setTimeout(() => {
//   clearInterval(interval);
//   console.log("Goodbye!");
// }, 5000);
import index from '../index.html'

type WSData = {
  createdAt: number,
  channelName: string
}

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index
  },
  fetch(req, server) {
    const channelQuery = 'channelName'
    const channelName = new URL(req.url)
      .searchParams.get(channelQuery) || ''

    // console.log({
    //   channelName
    // });

    server.upgrade(req, {
      // this object must conform to WSData
      data: {
        createdAt: Date.now(),
        channelName,
      },
    });

    return undefined;







    // upgrade the request to a WebSocket
    // if (server.upgrade(req)) {
    // return; // do not return a Response
    // }




    // return new Response("Upgrade failed", { status: 500 });
  },
  /**
   * instead of using an event-based API, ServerWebSocket 
   * expects you to pass a single object with methods for each 
   * event in Bun.serve() and it is reused for each connection.
   */
  websocket: {
    // To strongly type ws.data, add a data property
    // to the websocket handler object.
    // This types ws.data across all lifecycle hooks.
    data: {} as WSData,
    // By default, Bun will close a WebSocket connection if it
    // is idle for 120 seconds. This can be configured with the
    //  idleTimeout parameter.
    idleTimeout: 60,
    // Bun will also close a WebSocket connection if it
    //  receives a message that is larger than 16 MB.
    //  This can be configured with the maxPayloadLength 
    // parameter.
    maxPayloadLength: 1024 * 1024,
    // The first argument to each handler is the instance of
    //  ServerWebSocket handling the event. 
    // The ServerWebSocket class is a fast, Bun-native 
    // implementation of WebSocket with some additional features.
    message(ws, message) {
      console.log("websocket:message ws is here", !!ws);
      console.log("websocket:message new message", message);

      // console.log({
        // ws,
      //   message
      // });

      ws.send(String(message).toUpperCase());

      /**
       * ws.send(message); // echo back the message
       * ws.send("Hello world"); // string
       * ws.send(response.arrayBuffer()); // ArrayBuffer
       * ws.send(new Uint8Array([1, 2, 3])); // TypedArray | 
       * DataView
      */

    }, // a message is received
    open(ws) {
      console.log("websocket:open ws is here", !!ws);
      console.log("websocket:open new client connected");

      /**
       * -1 — The message was enqueued but there is backpressure
       * 0 — The message was dropped due to a connection issue
       * 1+ — The number of bytes sent
       * 
       * "Idle" means not active, not in use, or not working.
      */
      //  const sendResult = ws.send("Bienvenido al mejor servidor del mundo!");
      // console.log("Desde el server le envie un msj y resulto:", sendResult);

      /**
       * NOTA: con ws.send enviamos mensaje individual al cliente actual.
       * 
       *  probamos ws.publish para publicar un mensaje a una sala de chat
       *  para eso debemos suscribir a este cliente a un canal, 
       *  tambien debemos identificar al canal con un nombre.
       * 
       *  Una vez suscritos a un canal podemos publicar mensajes
       *  para los demas subscriptores.
       */
      ws.subscribe("chat")

      /**
       *  publish() envia un mensaje a todos los miembros de
       *  un canal excepto el miembro que llamo a la funcion,
       *  para enviar un mensajes a todos los subscriptores, se
       *  usa .publish() desde la instancia del servidor
       */
      server.publish("chat", "un usuario entró al chat");

    }, // a socket is opened
    close(ws, code, message) {
      console.log("websocket:close ws is here", !!ws);
      console.log("websocket:close message is here", !!message);
      console.log("websocket:close client disconnected", code, message);

      ws.unsubscribe("chat");

      server.publish("chat", "un usuario abandonó el chat");

      // console.log({
      //   ws,
      //   code,
      //   message
      // });

    }, // a socket is closed
    // drain(ws) { }, // the socket is ready to receive more data
  }, // handlers
});

// console.log("Server listening on:", server.url);
console.log(`Listening on ${server.hostname}:${server.port} - open your web browser`);