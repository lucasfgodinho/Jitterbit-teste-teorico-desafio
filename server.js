const express = require("express");
const mongoose = require("mongoose");
const app = express();
app.use(express.json());


mongoose.connect("mongodb://localhost:27017/ordersDB")
  .then(() => console.log("Mongo conectado!"))
  .catch(err => console.log(err));


const ItemSchema = new mongoose.Schema({
  productId: Number,
  quantity: Number,
  price: Number
});

const OrderSchema = new mongoose.Schema({
  orderId: String,
  value: Number,
  creationDate: Date,
  items: [ItemSchema]
});

const Order = mongoose.model("Order", OrderSchema);


app.post("/order", async (req, res) => {
  try {
    const body = req.body;

    const mapped = {
      orderId: body.numeroPedido,
      value: body.valorTotal,
      creationDate: new Date(body.dataCriacao),
      items: body.items.map(i => ({
        productId: Number(i.idItem),
        quantity: i.quantidadeItem,
        price: i.valorItem
      }))
    };

    const newOrder = await Order.create(mapped);
    res.status(201).json(newOrder);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


app.get("/order/:id", async (req, res) => {
  const order = await Order.findOne({ orderId: req.params.id });
  if (!order) return res.status(404).json({ message: "Pedido não encontrado" });

  res.json(order);
});


app.get("/order/list", async (req, res) => {
  const orders = await Order.find();
  res.json(orders);
});


app.put("/order/:id", async (req, res) => {
  const updated = await Order.findOneAndUpdate(
    { orderId: req.params.id },
    req.body,
    { new: true }
  );
  res.json(updated);
});


app.delete("/order/:id", async (req, res) => {
  await Order.deleteOne({ orderId: req.params.id });
  res.json({ message: "Pedido deletado" });
});

app.listen(3000, () => console.log("API rodando na 3000"));
