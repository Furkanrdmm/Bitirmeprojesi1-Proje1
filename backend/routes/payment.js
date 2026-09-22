const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const Product = require("../models/Product.js");
const Coupon = require("../models/Coupon.js");
const User = require("../models/User.js");
const { verifyToken, requireAdmin } = require("../middleware/auth.js");

const CARGO_FEE = 15;

// Ödeme oturumu oluşturma
// Fiyatlar istemciden alınmaz; veritabanındaki ürün fiyatı, ürün indirimi
// ve kupon indirimi sunucuda hesaplanır.
router.post("/", verifyToken, async (req, res) => {
  try {
    const { items, couponCode, fastCargo } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty." });
    }

    let couponPercent = 0;
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) {
        return res.status(400).json({ error: "Invalid coupon." });
      }
      couponPercent = coupon.discountPercent;
    }

    const lineItems = [];
    for (const item of items) {
      const quantity = Number(item.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({ error: "Invalid quantity." });
      }

      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(400).json({ error: "Product not found." });
      }

      const { current, discount = 0 } = product.price;
      const unitPrice =
        current * (1 - discount / 100) * (1 - couponPercent / 100);

      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: product.name },
          unit_amount: Math.round(unitPrice * 100),
        },
        quantity,
      });
    }

    if (fastCargo) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: { name: "Hızlı Kargo" },
          unit_amount: CARGO_FEE * 100,
        },
        quantity: 1,
      });
    }

    const user = await User.findById(req.user.id);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      customer_email: user ? user.email : undefined,
      success_url: `${process.env.CLIENT_DOMAIN}/success`,
    });

    res.status(200).json({ id: session.id });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error." });
  }
});

// Siparişleri listeleme (sadece admin)
router.get("/orders", verifyToken, requireAdmin, async (req, res) => {
  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 100 });

    const orders = sessions.data.map((session) => ({
      id: session.id,
      email: session.customer_details?.email || session.customer_email,
      amount: session.amount_total / 100,
      status: session.payment_status,
      createdAt: new Date(session.created * 1000),
    }));

    res.status(200).json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error." });
  }
});

module.exports = router;
