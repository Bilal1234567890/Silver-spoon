import cron from 'node-cron';
import { Op } from 'sequelize';
import Order from './Order.js';
import User from './User.js';

// Run every hour
cron.schedule('0 * * * *', async () => {
  console.log('⏰ Running daily income cron...');
  try {
    const now = new Date();
    const activeOrders = await Order.findAll({
      where: {
        status: 'active',
        endDate: { [Op.gt]: now },
      },
    });

    for (const order of activeOrders) {
      const lastIncome = order.lastIncomeDate || order.startDate;
      const diffHours = (now.getTime() - new Date(lastIncome).getTime()) / (1000 * 60 * 60);
      if (diffHours >= 24) {
        // Add daily income to user
        const user = await User.findByPk(order.userId);
        if (user) {
          user.balance = Number(user.balance) + Number(order.dailyIncome);
          await user.save();
          // Update last income date
          order.lastIncomeDate = now;
          await order.save();
          console.log(`✅ Added daily income to user ${user.id} for order ${order.id}`);
        }
      }
    }

    // Mark orders as inactive if endDate passed
    await Order.update(
      { status: 'inactive' },
      {
        where: {
          status: 'active',
          endDate: { [Op.lt]: now },
        },
      }
    );
  } catch (err) {
    console.error('❌ Cron error:', err);
  }
});