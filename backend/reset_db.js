const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/our-universe')
    .then(async () => {
        console.log('MongoDB Connected');

        try {
            await User.deleteMany({});
            console.log('✨ All users have been deleted. Database is fresh! ✨');
        } catch (err) {
            console.error('Error clearing users:', err);
        } finally {
            mongoose.disconnect();
            console.log('Disconnected');
            process.exit();
        }
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
