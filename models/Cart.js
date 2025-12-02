const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "user"
  },

  // 🔥 Each user has their OWN cart
  cart: [
    {
      productId: mongoose.Schema.Types.ObjectId,
      size: String,
      quantity: Number
    }
  ]
});
