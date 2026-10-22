// ... existing imports ...
import Order from "../models/Order.js";
import Cart from "../models/Cart.js"; // 👈 Add Cart Model import

router.post("/", async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, totalPrice, userId, userName, userEmail } = req.body;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: "No items in cart" });
    }

    const order = new Order({
      user: userId || null,
      userName: userName || shippingAddress?.name || "Customer",
      userEmail: userEmail || "",
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod || "cod",
      totalPrice,
    });

    const savedOrder = await order.save();

    // 🔥 User logged-in-ah irundha avanga Cart Table-la items-ai empty panrom:
    if (userId) {
      await Cart.findOneAndUpdate({ user: userId }, { items: [] });
    }

    res.status(201).json({
      message: "Order placed successfully!",
      order: savedOrder,
    });
  } catch (error) {
    console.error("CREATE ORDER ERROR:", error);
    res.status(500).json({ message: "Failed to place order" });
  }
});