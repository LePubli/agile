import Next from 'next';

const port = parseInt(process.env.PORT || '3001', 10);
const dev = process.env.NODE_ENV !== 'production';
const app = Next({ dev, dir: './' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  console.log(`🚀 NexusOS Web running on port ${port}`);
});

export default async function handler(req, res) {
  try {
    await app.getRequestHandler()(req, res);
  } catch (err) {
    console.error('Error occurred handling', req.url, err);
    res.statusCode = 500;
    res.end('internal server error');
  }
}
