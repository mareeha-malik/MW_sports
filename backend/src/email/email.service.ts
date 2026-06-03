import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  async sendConfirmationEmail(email: string, username: string, confirmationLink: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: 'Welcome to MW Sports - Confirm Your Email',
      html: `
        <h2>Welcome to MW Sports, ${username}!</h2>
        <p>Thank you for signing up. Please confirm your email address by clicking the link below:</p>
        <p><a href="${confirmationLink}" style="background-color: #F97316; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Confirm Email</a></p>
        <p>If you didn't create this account, please ignore this email.</p>
        <p>Best regards,<br>MW Sports Team</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderConfirmationEmail(email: string, customerName: string, orderNumber: string, orderDetails: any): Promise<void> {
    const itemsHtml = orderDetails.items
      .map(
        (item: any) =>
          `<tr>
        <td>${item.productName}</td>
        <td>${item.quantity}</td>
        <td>PKR ${item.price}</td>
        <td>PKR ${item.quantity * item.price}</td>
      </tr>`,
      )
      .join('');

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Order Confirmed - ${orderNumber}`,
      html: `
        <h2>Your Order Has Been Confirmed!</h2>
        <p>Hi ${customerName},</p>
        <p>Thank you for your order. We're excited to fulfill it!</p>
        
        <h3>Order Details:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background-color: #f5f5f5;">
            <th style="border: 1px solid #ddd; padding: 8px;">Product</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Quantity</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Price</th>
            <th style="border: 1px solid #ddd; padding: 8px;">Total</th>
          </tr>
          ${itemsHtml}
        </table>
        
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>Total Amount:</strong> PKR ${orderDetails.totalAmount}</p>
        <p><strong>Shipping Address:</strong> ${orderDetails.shippingAddress}</p>
        
        <p>We will notify you as soon as your order is shipped. Track your order status anytime on our website.</p>
        
        <p>Best regards,<br>MW Sports Team</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendOrderStatusEmail(email: string, customerName: string, orderNumber: string, status: string, additionalInfo?: string): Promise<void> {
    const statusMessages: { [key: string]: string } = {
      CONFIRMED: 'Your order has been confirmed and is being prepared for shipment.',
      SHIPPED: 'Your order has been shipped! You can track your package using the tracking number below.',
      DELIVERED: 'Your order has been delivered. Thank you for your purchase!',
      CANCELLED: 'Your order has been cancelled. If you have any questions, please contact our support team.',
      PENDING: 'Your order is pending. We are processing it.',
    };

    const statusMessage = statusMessages[status] || 'Your order status has been updated.';

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: email,
      subject: `Order ${status} - ${orderNumber}`,
      html: `
        <h2>Order Status Update</h2>
        <p>Hi ${customerName},</p>
        <p>${statusMessage}</p>
        
        <p><strong>Order Number:</strong> ${orderNumber}</p>
        <p><strong>New Status:</strong> ${status}</p>
        
        ${additionalInfo ? `<p><strong>Additional Information:</strong> ${additionalInfo}</p>` : ''}
        
        <p>Thank you for shopping with MW Sports!</p>
        
        <p>Best regards,<br>MW Sports Team</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendLowStockNotificationEmail(adminEmail: string, productName: string, currentStock: number): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
      to: adminEmail,
      subject: `Low Stock Alert - ${productName}`,
      html: `
        <h2>Low Stock Alert</h2>
        <p>The following product is running low on stock:</p>
        
        <p><strong>Product Name:</strong> ${productName}</p>
        <p><strong>Current Stock:</strong> ${currentStock}</p>
        
        <p>Please reorder to avoid stockouts.</p>
        
        <p>Best regards,<br>MW Sports System</p>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
