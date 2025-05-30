const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// 定义一个非常简单的测试模型（collection 名叫 testitems）
const testSchema = new mongoose.Schema({
  name: String,
  timestamp: Date,
});
const TestItem = mongoose.model("TestItem", testSchema);

// GET /api/test-db → 查询全部
router.get("/", async (req, res) => {
  try {
    const items = await TestItem.find({});
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/test-db → 创建一个新 item
router.post("/", async (req, res) => {
  try {
    const newItem = await TestItem.create({
      name: "Test " + new Date().toISOString(),
      timestamp: new Date(),
    });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/test-db → 清空所有测试数据
router.delete("/", async (req, res) => {
  try {
    await TestItem.deleteMany({});
    res.json({ message: "All test items deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
