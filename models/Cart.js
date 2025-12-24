const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    default: "user",
  },

 cart: {
  type: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",   // 🔥 THIS IS THE KEY FIX
        required: true,
      },
      size: {
        type: String,
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  default: [],
},

});
