function parsePositiveInteger(value) {
  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : null;
}

function sendError(res, status, code, message) {
  res.locals.errorCode = code;

  return res.status(status).json({
    error: {
      code,
      message,
      requestId: res.locals.requestId || null,
    },
  });
}

function sendNotFound(res) {
  return sendError(res, 404, "ROUTE_NOT_FOUND", "Rota não encontrada.");
}

module.exports = {
  parsePositiveInteger,
  sendError,
  sendNotFound,
};
