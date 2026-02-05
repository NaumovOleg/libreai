import express from 'express';
import mongoose from 'mongoose';
import rootRouter from './routes/rootRouter';

const app = express();
const PORT = 3000;
const MONGO_URI = 'mongodb://localhost:27017/myapp';

app.use(express.json());
app.use('/', rootRouter);

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
  });
