const { PrismaClient } = require('@prisma/client');
const axios = require('axios');
const crypto = require('crypto');
const config = require('../config/index.cjs');

const prisma = new PrismaClient();

// Generate MPESA STK Push password
const generatePassword = () => {
  const { shortCode, passKey } = config.mpesa;
  const timestamp = new Date().toISOString().replace(/[-:T.]/g, '').slice(0, 14);
  const password = crypto.createHash('md5').update(`${shortCode}${passKey}${timestamp}`).digest('hex');
  return { password, timestamp };
};

// Get MPESA access token
const getAccessToken = async () => {
  const { consumerKey, consumerSecret, env } = config.mpesa;
  const url = env === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  console.log('MPESA Auth - Key length:', consumerKey?.length, 'Secret length:', consumerSecret?.length);
  console.log('MPESA Auth header (first 20 chars):', auth.substring(0, 20) + '...');

  const response = await axios.get(url, {
    headers: { Authorization: `Basic ${auth}` },
  });

  return response.data.access_token;
};

// STK Push request
const initiateSTKPush = async (phone, amount, accountReference, description) => {
  const { shortCode, callbackUrl, env } = config.mpesa;
  const { password, timestamp } = generatePassword();
  const accessToken = await getAccessToken();

  const url = env === 'sandbox'
    ? 'https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest'
    : 'https://api.safaricom.co.ke/mpesa/stkpush/v1/processrequest';

  const payload = {
    BusinessShortCode: shortCode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.round(amount),
    PartyA: phone,
    PartyB: shortCode,
    PhoneNumber: phone,
    CallBackURL: callbackUrl,
    AccountReference: accountReference,
    TransactionDesc: description || 'Membership Payment',
  };

  const response = await axios.post(url, payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });

  return response.data;
};

const getAll = async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const where = {};
  if (status && status.toUpperCase() !== 'ALL') where.status = status;

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      include: { member: { select: { id: true, memberCode: true, firstName: true, lastName: true } }, package: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
    }),
    prisma.payment.count({ where: where.status ? where : {} }),
  ]);

  res.json({
    success: true,
    data: { data, total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
  });
};

const getStats = async (req, res) => {
  const { period = 'month' } = req.query;
  const now = new Date();
  let startDate;
  if (period === 'day') startDate = new Date(now.setHours(0, 0, 0, 0));
  else if (period === 'week') startDate = new Date(now.setDate(now.getDate() - 7));
  else if (period === 'year') startDate = new Date(now.setFullYear(now.getFullYear() - 1));
  else startDate = new Date(now.setMonth(now.getMonth() - 1));

  const payments = await prisma.payment.findMany({ where: { createdAt: { gte: startDate } } });
  res.json({
    success: true,
    data: {
      total: payments.filter(p => p.status === 'COMPLETED').reduce((sum, p) => sum + Number(p.amount), 0),
      count: payments.length,
      completed: payments.filter(p => p.status === 'COMPLETED').length,
      pending: payments.filter(p => p.status === 'PENDING').length,
      failed: payments.filter(p => p.status === 'FAILED').length,
    },
  });
};

// Create payment with STK Push
const createPayment = async (req, res) => {
  try {
    const { memberId, packageId, phone } = req.body;

    // Get member and package
    const member = await prisma.member.findUnique({ where: { id: memberId } });
    const pkg = await prisma.package.findUnique({ where: { id: packageId } });

    if (!member || !pkg) {
      return res.status(404).json({ success: false, message: 'Member or package not found' });
    }

    // Create pending payment
    const payment = await prisma.payment.create({
      data: {
        amount: pkg.price,
        mpesaPhone: phone || member.phone,
        status: 'PENDING',
        memberId,
        packageId,
      },
    });

    // Send STK Push if phone provided
    if (phone || member.phone) {
      const stkPhone = phone || member.phone;
      // Format phone number (remove + and ensure starts with 254)
      const formattedPhone = stkPhone.startsWith('+') ? stkPhone.replace('+', '') : stkPhone;
      const cleanPhone = formattedPhone.startsWith('0') ? `254${formattedPhone.slice(1)}` : formattedPhone;

      try {
        const stkResult = await initiateSTKPush(
          cleanPhone,
          Number(pkg.price),
          member.memberCode,
          `${pkg.name} - Membership Payment`
        );

        // Update payment with STK result
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            mpesaTransactionId: stkResult.CheckoutRequestID,
          },
        });

        return res.json({
          success: true,
          message: 'Payment initiated. Please check your phone for STK push.',
          data: {
            paymentId: payment.id,
            checkoutRequestId: stkResult.CheckoutRequestID,
            merchantRequestId: stkResult.MerchantRequestID,
          },
        });
      } catch (stkError) {
        console.error('STK Push error:', stkError.response?.data || stkError.message);
        return res.json({
          success: true,
          message: 'Payment created but STK push failed. Please try again.',
          data: { paymentId: payment.id },
          stkError: stkError.response?.data || stkError.message,
        });
      }
    }

    res.json({ success: true, message: 'Payment created', data: payment });
  } catch (error) {
    console.error('Create payment error:', error);
    res.status(500).json({ success: false, message: 'Failed to create payment', error: error.message });
  }
};

// MPESA Callback handler
const mpesaCallback = async (req, res) => {
  try {
    const callbackData = req.body;

    console.log('MPESA Callback received:', JSON.stringify(callbackData, null, 2));

    const result = callbackData.Body?.stkCallback || callbackData;

    if (result.ResultCode === 0) {
      // Payment successful
      const { CheckoutRequestID, CallbackMetadata } = result;
      const metadata = CallbackMetadata?.Item || [];

      const mpesaReceipt = metadata.find(i => i.Name === 'MpesaReceiptNumber')?.Value;
      const amount = metadata.find(i => i.Name === 'Amount')?.Value;
      const phone = metadata.find(i => i.Name === 'PhoneNumber')?.Value;
      const transactionId = metadata.find(i => i.Name === 'TransactionID')?.Value;

      // Find payment by checkout request ID
      const payment = await prisma.payment.findFirst({
        where: { mpesaTransactionId: CheckoutRequestID },
      });

      if (payment) {
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'COMPLETED',
            mpesaReceipt,
            mpesaTransactionId: transactionId,
            resultDesc: result.ResultDesc,
            paidAt: new Date(),
          },
        });

        // Update member expiry if this is a new payment (not renewal)
        if (!payment.renewalId) {
          const pkg = await prisma.package.findUnique({ where: { id: payment.packageId } });
          const member = await prisma.member.findUnique({ where: { id: payment.memberId } });

          const newExpiry = new Date(member.expiresAt);
          newExpiry.setDate(newExpiry.getDate() + pkg.durationDays);

          await prisma.member.update({
            where: { id: payment.memberId },
            data: { expiresAt: newExpiry, status: 'ACTIVE' },
          });

          // Create renewal record
          await prisma.renewal.create({
            data: {
              memberId: payment.memberId,
              packageId: payment.packageId,
              paymentId: payment.id,
              previousExpiry: member.expiresAt,
              newExpiry,
              amount: payment.amount,
            },
          });
        }
      }
    } else {
      // Payment failed
      const { CheckoutRequestID } = result;
      await prisma.payment.updateMany({
        where: { mpesaTransactionId: CheckoutRequestID },
        data: {
          status: 'FAILED',
          resultDesc: result.ResultDesc,
        },
      });
    }

    res.json({ ResultCode: 0, ResultDesc: 'Success' });
  } catch (error) {
    console.error('Callback error:', error);
    res.status(500).json({ ResultCode: 1, ResultDesc: 'Failed' });
  }
};

module.exports = { getAll, getStats, createPayment, mpesaCallback };
