const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const cors = require('cors');
const app = express();
const port = 3030;

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// قراءة ملفات الـ JSON الأولية للبيانات
const dealershipsData = JSON.parse(fs.readFileSync('data/dealerships.json', 'utf8'));
const reviewsData = JSON.parse(fs.readFileSync('data/reviews.json', 'utf8'));

// استدعاء النماذج (Schemas)
const Dealership = require('./dealership');
const Review = require('./review');

// الاتصال بقاعدة البيانات وإدخال البيانات الأولية إن لم تكن موجودة
mongoose.connect('mongodb://localhost:27017/dealershipsDB', { useNewUrlParser: true });
async function populateDB() {
  try {
    await Dealership.deleteMany({});
    await Dealership.insertMany(dealershipsData.dealerships);
    
    await Review.deleteMany({});
    await Review.insertMany(reviewsData.reviews);
    
    console.log("Database populated successfully!");
  } catch (error) {
    console.log("Error populating database:", error);
  }
}

populateDB();

// 1. Endpoint: جلب جميع الوكلاء (fetchDealers)
app.get('/fetchDealers', async (req, res) => {
  try {
    const dealers = await Dealership.find();
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching dealers" });
  }
});

// 2. Endpoint: جلب الوكلاء حسب الولاية (fetchDealers/:state)
app.get('/fetchDealers/:state', async (req, res) => {
  try {
    const state = req.params.state;
    const dealers = await Dealership.find({ state: state });
    res.json(dealers);
  } catch (error) {
    res.status(500).json({ error: "Error fetching dealers by state" });
  }
});

// 3. Endpoint: جلب وكيل محدد بالـ ID (fetchDealer/:id)
app.get('/fetchDealer/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const dealer = await Dealership.findOne({ id: Number(id) });
    if (!dealer) {
      return res.status(404).json({ error: "Dealer not found" });
    }
    res.json(dealer);
  } catch (error) {
    res.status(500).json({ error: "Error fetching dealer by ID" });
  }
});

// 4. Endpoint: جلب جميع التقييمات (fetchReviews)
app.get('/fetchReviews', async (req, res) => {
  try {
    const reviews = await Review.find();
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
});

// 5. Endpoint: جلب تقييمات وكيل معين (fetchReviews/dealer/:id)
app.get('/fetchReviews/dealer/:id', async (req, res) => {
  try {
    const dealerId = req.params.id;
    const reviews = await Review.find({ dealership: Number(dealerId) });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Error fetching reviews for dealer" });
  }
});

// 6. Endpoint: إضافة تقييم جديد (insert_review)
app.post('/insert_review', async (req, res) => {
  try {
    const data = req.body;
    const review = new Review({
      id: data.id,
      name: data.name,
      dealership: data.dealership,
      review: data.review,
      purchase: data.purchase,
      purchase_date: data.purchase_date,
      car_make: data.car_make,
      car_model: data.car_model,
      car_year: data.car_year,
    });
    
    const savedReview = await review.save();
    res.json(savedReview);
  } catch (error) {
    res.status(500).json({ error: "Error inserting review" });
  }
});

app.get('/', (re, res) => {
  res.send("Welcome to the Dealership API Backend");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});