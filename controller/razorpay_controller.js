const Razorpay = require('razorpay');

var instance = new Razorpay({
  key_id: process.env.RAZOR_PAY_ID,
  key_secret: process.env.RAZOR_PAY_SECRET_KEY,
});


module.exports = {
    intiateRazorpay: (orderId,amount) => [
        instance.orders.create({
            amount: amount,
            currency: "INR",
            receipt: "orderId",
            notes: {
              key1: "value3",
              key2: "value2"
            }
          })
    ]
}