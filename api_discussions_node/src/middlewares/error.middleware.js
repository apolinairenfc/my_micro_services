const errorMiddleware = (err, req, res, next) => {
  if (err && err.name === 'CastError') {
    return res.status(400).json({ error: 'invalid_id' });
  }

  if (err && err.name === 'ValidationError') {
    const details = Object.values(err.errors || {}).map((error) => ({
      field: error.path,
      message: error.message,
    }));

    return res.status(400).json({ error: 'validation_error', details });
  }

  console.error('[error]', err);
  return res.status(500).json({ error: 'internal_error', message: 'Unexpected error.' });
};

module.exports = errorMiddleware;
