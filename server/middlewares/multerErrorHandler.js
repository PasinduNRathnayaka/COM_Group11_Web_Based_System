// server/middlewares/multerErrorHandler.js

export default function (err, req, res, next) {
  if (err.name === 'MulterError') {
    return res.status(400).json({ error: err.message });
  }

  // Optional: handle other types of errors here
  return res.status(500).json({ error: 'Something went wrong.' });
}
