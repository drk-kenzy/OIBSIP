const jwt = require('jsonwebtoken');

function setupSockets(io) {
  io.on('connection', socket => {
    socket.on('auth:user', token => {
      try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        socket.join(`user:${payload.userId}`);
      } catch {
        // jeton invalide : la socket reste anonyme, pas de mise a jour temps reel
      }
    });

    socket.on('auth:admin', token => {
      try {
        jwt.verify(token, process.env.ADMIN_JWT_SECRET);
        socket.join('admin:orders');
      } catch {
        // jeton admin invalide, ignore
      }
    });

    socket.on('order:watch', orderId => {
      if (typeof orderId === 'string') socket.join(`order:${orderId}`);
    });
  });
}

module.exports = setupSockets;
