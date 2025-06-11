const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const router = express.Router();

const upload = multer(); // stores file in memory

router.post("/send-payment-pdf", upload.single("pdf"), async (req, res) => {
  try {
    const pdfBuffer = req.file?.buffer;

    if (!pdfBuffer) {
      return res.status(400).json({ error: "No PDF uploaded" });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // e.g. your_email@gmail.com
        pass: process.env.EMAIL_PASS, // App password or env var
      },
    });

    await transporter.sendMail({
      from: `"DRMG System" <${process.env.EMAIL_USER}>`,
      to: "br667430@dal.ca",
      subject: "Payment Information Submission",
      text: "Attached is the submitted payment PDF.",
      attachments: [
        {
          filename: req.file.originalname || "payment-info.pdf",
          content: pdfBuffer,
        },
      ],
    });

    res.json({ success: true, message: "Email sent to abc@drgm.com" });
  } catch (err) {
    console.error("Email sending error:", err);
    res.status(500).json({ error: "Failed to send email" });
  }
});

module.exports = router;
