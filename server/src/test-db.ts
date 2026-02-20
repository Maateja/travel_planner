import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
console.log('Testing connection to:', uri?.replace(/:([^@]+)@/, ':****@'));

mongoose.connect(uri as string)
  .then(() => {
    console.log('Connection SUCCESS');
    process.exit(0);
  })
  .catch(err => {
    console.error('Connection FAILED');
    console.error(err);
    process.exit(1);
  });
