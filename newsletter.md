To add a **subscribe to newsletter** feature to your blogging website using **Node.js** and **Mongoose**, follow these steps:

---

## **1. Set Up Mongoose Schema**

Create a `Subscriber` model to store email addresses.

```js
const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  subscribedAt: { type: Date, default: Date.now },
});

const Subscriber = mongoose.model('Subscriber', subscriberSchema);

module.exports = Subscriber;
```

---

## **2. Create an API Route for Subscription**

Set up an API route to handle newsletter subscriptions.

```js
const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');

// Subscribe to Newsletter
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Check if the email already exists
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      return res.status(400).json({ error: 'You are already subscribed' });
    }

    // Save new subscriber
    const newSubscriber = new Subscriber({ email });
    await newSubscriber.save();

    return res.status(201).json({ message: 'Subscription successful' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
```

---

## **3. Integrate with Express**

Make sure your **Express app** can handle JSON requests and uses the `subscribe` route.

```js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const subscriberRoutes = require('./routes/subscribe');

const app = express();

// Middleware
app.use(express.json());
app.use(cors()); // Allows frontend to access API

// Connect to MongoDB
mongoose
  .connect('mongodb://127.0.0.1:27017/blog', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error(err));

// Routes
app.use('/api', subscriberRoutes);

// Start Server
app.listen(5000, () => console.log('Server running on port 5000'));
```

---

## **4. Frontend Form (HTML & JavaScript)**

Add a simple subscription form to your frontend:

```html
<form id="subscribeForm">
  <input type="email" id="email" placeholder="Enter your email" required />
  <button type="submit">Subscribe</button>
</form>

<p id="message"></p>

<script>
  document
    .getElementById('subscribeForm')
    .addEventListener('submit', async (event) => {
      event.preventDefault();
      const email = document.getElementById('email').value;

      const response = await fetch('http://localhost:5000/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      document.getElementById('message').innerText = data.message || data.error;
    });
</script>
```

---

## **5. Sending Newsletters (Optional)**

To send newsletters, you can use **Nodemailer** with Gmail or SMTP.

### Install Nodemailer

```sh
npm install nodemailer
```

### Create a Mail Service

```js
const nodemailer = require('nodemailer');

const sendNewsletter = async (subject, content) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'your-email@gmail.com',
      pass: 'your-email-password',
    },
  });

  const subscribers = await Subscriber.find();
  const emails = subscribers.map((sub) => sub.email);

  const mailOptions = {
    from: 'your-email@gmail.com',
    to: emails.join(','),
    subject: subject,
    text: content,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendNewsletter;
```

---

## **6. Trigger Sending Emails**

Create an endpoint to send newsletters manually.

```js
router.post('/send-newsletter', async (req, res) => {
  const { subject, content } = req.body;
  try {
    await sendNewsletter(subject, content);
    res.json({ message: 'Newsletter sent successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending newsletter' });
  }
});
```

---

## **Summary**

✅ **Subscribers are stored in MongoDB**  
✅ **Users can subscribe via a simple form**  
✅ **Nodemailer can send newsletters**

This setup ensures a **secure, scalable, and efficient** newsletter system in **Node.js** & **Mongoose**. 🚀 Let me know if you need any improvements!
