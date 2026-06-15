require('dotenv').config();
const mongoose = require('./mockMongoose');
const User = require('./models/User');
const Product = require('./models/Product');

const productsData = [
  // Electronics
  {
    name: 'Apple iPhone 15',
    description: 'Experience the ultimate iPhone featuring the Dynamic Island, a 48MP Main camera, and USB-C, all in a durable color-infused glass and aluminum design.',
    price: 799.99,
    category: 'Electronics',
    stock: 15,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Samsung Galaxy S24',
    description: 'Welcome to the era of mobile AI. With Galaxy S24, you can unleash whole new levels of creativity, productivity, and possibility starting from your phone.',
    price: 749.99,
    category: 'Electronics',
    stock: 12,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Dell XPS 13 Laptop',
    description: 'Premium thin-and-light laptop with stunning 13.4-inch InfinityEdge display, Intel Core Ultra processor, and premium aluminum chassis.',
    price: 1099.99,
    category: 'Electronics',
    stock: 8,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Sony WH-1000XM5 Headphones',
    description: 'Industry-leading noise canceling wireless headphones with auto NC optimizer, crystal clear hands-free calling, and Alexa voice control.',
    price: 349.99,
    category: 'Electronics',
    stock: 20,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=80'
  },
  // Clothing
  {
    name: 'Casual Cotton Shirt',
    description: 'A comfortable, breathable casual shirt crafted from 100% organic cotton. Features a relaxed button-down collar and regular fit.',
    price: 29.99,
    category: 'Clothing',
    stock: 45,
    rating: 4.2,
    image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Comfort Fleece Hoodie',
    description: 'Super soft midweight pullover fleece hoodie. Features a front kangaroo pocket, matching drawstring, and ribbed cuffs for warmth.',
    price: 49.99,
    category: 'Clothing',
    stock: 30,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Slim Fit Stretch Jeans',
    description: 'Classic 5-pocket denim jeans with a modern slim fit and added elastane stretch for all-day comfort and flexible movement.',
    price: 59.99,
    category: 'Clothing',
    stock: 0, // Mock out-of-stock item
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Designer Embroidered Kurti',
    description: 'Beautiful women ethnic wear Kurti with premium gold-thread embroidery. Crafted from breathable linen-cotton blend.',
    price: 34.99,
    category: 'Clothing',
    stock: 22,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'
  },
  // Books
  {
    name: 'Atomic Habits',
    description: 'Written by James Clear, this book presents an easy and proven way to build good habits and break bad ones with tiny, daily changes.',
    price: 16.99,
    category: 'Books',
    stock: 100,
    rating: 4.9,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Rich Dad Poor Dad',
    description: 'Robert T. Kiyosaki outlines what the rich teach their kids about money that the poor and middle class do not, challenging traditional financial notions.',
    price: 14.99,
    category: 'Books',
    stock: 80,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1592496431122-2349e0fbc666?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Deep Work',
    description: 'Cal Newport argues that focus is the superpower of the 21st century, providing actionable rules for focused success in a distracted world.',
    price: 15.99,
    category: 'Books',
    stock: 55,
    rating: 4.8,
    image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80'
  },
  // Home
  {
    name: 'Solid Oak Dining Table',
    description: 'Sturdy and elegant dining table constructed from sustainably sourced solid oak wood. Smooth finish, seats up to six comfortability.',
    price: 449.99,
    category: 'Home',
    stock: 5,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1615066390971-03e4e1c36ddf?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Adjustable LED Study Lamp',
    description: 'Dimmable desk lamp with 5 color temperatures, USB charging port, flexible goose-neck design, and eye-friendly diffusion filter.',
    price: 24.99,
    category: 'Home',
    stock: 50,
    rating: 4.4,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Modern Silent Wall Clock',
    description: '12-inch modern minimalist wall clock. Silent non-ticking quartz mechanism ensures an accurate time and quiet working environment.',
    price: 19.99,
    category: 'Home',
    stock: 40,
    rating: 4.1,
    image: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=600&auto=format&fit=crop&q=80'
  },
  // Sports
  {
    name: 'Premium English Willow Cricket Bat',
    description: 'Handcrafted English Willow cricket bat with premium cane handle for superb shock absorption, thick edges, and dynamic sweet spot.',
    price: 129.99,
    category: 'Sports',
    stock: 6,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1531415080290-bc98545ab3ef?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'All-Weather Size 5 Football',
    description: 'Durable synthetic leather match football with machine-stitched seams and butyl bladder for maximum air retention and roundness.',
    price: 29.99,
    category: 'Sports',
    stock: 35,
    rating: 4.3,
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Eco-Friendly Non-Slip Yoga Mat',
    description: '6mm extra thick TPE yoga mat with dual-sided non-slip texture. Provides premium cushioning, joint protection, and carrying strap.',
    price: 21.99,
    category: 'Sports',
    stock: 42,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=600&auto=format&fit=crop&q=80'
  },
  // Other
  {
    name: 'Water-Resistant Travel Backpack',
    description: 'Large capacity 35L backpack with multiple compartments, dedicated 15.6" laptop sleeve, USB charging interface, and lockable zippers.',
    price: 39.99,
    category: 'Other',
    stock: 28,
    rating: 4.6,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Ergonomic Mesh Office Chair',
    description: 'Desk chair with high back, adjustable lumbar support, 3D armrests, pneumatic tilt lock system, and smooth rolling nylon casters.',
    price: 189.99,
    category: 'Other',
    stock: 14,
    rating: 4.5,
    image: 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=600&auto=format&fit=crop&q=80'
  },
  {
    name: 'Insulated Stainless Steel Water Bottle',
    description: 'Double-wall vacuum insulated water bottle keeping liquids ice cold for up to 24 hours or hot for up to 12 hours. Sweat-free finish.',
    price: 18.99,
    category: 'Other',
    stock: 65,
    rating: 4.7,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
  }
];

const seedDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    console.log('Connecting to database:', mongoURI);
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Database connected successfully!');

    // 1. Ensure Default Admin User Exists
    let admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.log('Admin user not found. Creating one...');
      admin = await User.create({
        name: 'ShopHub Admin',
        email: 'admin@example.com',
        password: 'admin123', // Will be hashed automatically by userSchema.pre('save')
        role: 'admin'
      });
      console.log('Admin user created successfully! Email: admin@example.com, Password: admin123');
    } else {
      console.log('Admin user already exists. Email:', admin.email);
    }

    // 2. Clear Existing Products
    console.log('Clearing existing products...');
    await Product.deleteMany({});
    console.log('Products cleared!');

    // 3. Seed Products with Admin Reference
    const productsToInsert = productsData.map(product => ({
      ...product,
      createdBy: admin._id
    }));

    console.log('Seeding products...');
    const insertedProducts = await Product.insertMany(productsToInsert);
    console.log(`Seeding complete! Successfully seeded ${insertedProducts.length} products.`);

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed.');
  }
};

seedDB();
