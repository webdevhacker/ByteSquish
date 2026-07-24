const cron = require('node-cron');
const User = require('../models/User');
const { transporter, getEmailTemplate } = require('../utils/email');

const startInactivityCron = () => {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('Running inactive accounts cron job...');
    const now = new Date();

    const date30DaysAgo = new Date(now);
    date30DaysAgo.setDate(date30DaysAgo.getDate() - 30);

    const date33DaysAgo = new Date(now);
    date33DaysAgo.setDate(date33DaysAgo.getDate() - 33);

    const date37DaysAgo = new Date(now);
    date37DaysAgo.setDate(date37DaysAgo.getDate() - 37);

    try {
      // 1st Reminder (Inactive > 30 days, State = 0)
      const firstReminderUsers = await User.find({
        isDeactivated: false,
        inactivityState: 0,
        lastActive: { $lte: date30DaysAgo }
      });

      for (const user of firstReminderUsers) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
          to: user.email,
          subject: "Your ByteSquish Account Is Inactive",
          text: `Hi ${user.name},\n\nWe noticed you haven't logged in for over 30 days. Your account will be deactivated in 7 days if you do not log in.\n\nPlease log in to keep your account active.`,
          html: getEmailTemplate(
            "Inactivity Notice",
            `Hi ${user.name}, we noticed you haven't logged in for over 30 days. Your account will be deactivated in 7 days if you do not log in.`,
            null,
            "Log in to keep your account active."
          )
        }).catch(console.error);

        user.inactivityState = 1;
        await user.save();
      }

      // 2nd Reminder (Inactive > 33 days, State = 1)
      const secondReminderUsers = await User.find({
        isDeactivated: false,
        inactivityState: 1,
        lastActive: { $lte: date33DaysAgo }
      });

      for (const user of secondReminderUsers) {
        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
          to: user.email,
          subject: "Final Notice: Your ByteSquish Account Will Be Deactivated",
          text: `Hi ${user.name},\n\nThis is your final reminder. Your account has been inactive for over 33 days and will be deactivated in 4 days.\n\nPlease log in to prevent deactivation.`,
          html: getEmailTemplate(
            "Final Notice",
            `Hi ${user.name}, your account has been inactive for over 33 days and will be deactivated very soon.`,
            null,
            "Log in to prevent deactivation."
          )
        }).catch(console.error);

        user.inactivityState = 2;
        await user.save();
      }

      // Deactivation (Inactive > 37 days, State = 2)
      const deactivationUsers = await User.find({
        isDeactivated: false,
        inactivityState: 2,
        lastActive: { $lte: date37DaysAgo }
      });

      for (const user of deactivationUsers) {
        user.isDeactivated = true;
        await user.save();

        await transporter.sendMail({
          from: process.env.SMTP_FROM || '"ByteSquish System" <noreply@bytesquish.com>',
          to: user.email,
          subject: "Your ByteSquish Account Has Been Deactivated",
          text: `Hi ${user.name},\n\nYour account has been deactivated due to inactivity for over 37 days.\n\nIf you want to reactivate your account, please contact support.`,
          html: getEmailTemplate(
            "Account Deactivated",
            `Hi ${user.name}, your account has been deactivated due to inactivity for over 37 days.`,
            null,
            "Contact support to reactivate your account."
          )
        }).catch(console.error);
      }

      console.log(`Cron job finished. Sent ${firstReminderUsers.length} 1st reminders, ${secondReminderUsers.length} 2nd reminders, and deactivated ${deactivationUsers.length} accounts.`);
    } catch (err) {
      console.error('Error running inactivity cron job:', err);
    }
  });
};

module.exports = startInactivityCron;
