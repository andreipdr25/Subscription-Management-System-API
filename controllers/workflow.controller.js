import dayjs from 'dayjs';
import { createRequire } from 'module';
import Subscription from '../models/subscription.model.js';
import {sendReminderEmail} from '../utils/send-email.js';
const require = createRequire(import.meta.url);
const { serve } = require('@upstash/workflow/express');


const REMINDERS = [7, 5, 2, 1]

export const sendReminders = serve(async (context) => {
    //substract subscription ID from a specific workflow
    const { subscriptionId } = context.requestPayload;
    //fetch the details about subsciption
    const subscription = await fetchSubscription(context, subscriptionId);

    //check if there is no subs or subs'status is not active, then return, dont send the reminder
    if(!subscription || subscription.status !== 'active') return;

    //else, we have to figure it out when is the renewal date using a package dayjs

    const renewalDate = dayjs(subscription.renewalDate);
    if (renewalDate.isBefore(dayjs())) {
        console.log(`Renewal date has passed for subscription ${subscription.id}. Stopping workflow.`);
        return;
    }

    for (const daysBefore of REMINDERS) {
        const reminderDate = renewalDate.subtract(daysBefore, 'day');
        // ex: renewal date = 22feb, reminder date = 15feb, 17, 20, 21


        if (reminderDate.isAfter(dayjs())) {
            await sleepUntilReminder(context, `Reminder ${daysBefore} days before`, reminderDate);
        }

        await triggerReminder(context, `${daysBefore} days before reminder`, subscription);
    }

});
    // Starting the context of getting the subscription and returning it up to subscription
const fetchSubscription = async (context, subscriptionId) => {
    return await context.run('get subscription', async () => {
        return Subscription.findById(subscriptionId).populate('user', 'name email');
    })
}

const sleepUntilReminder = async (context, label, date) => {
    console.log(`Sleeping until ${label} reminder at ${date}`);
    await context.sleepUntil(label, date.toDate());
}

const triggerReminder = async (context, label, subscription) => {
    return await context.run(label, async () => {
        console.log(`Triggering ${label} reminder`);
        //send email,sms etc

        await sendReminderEmail({
            to: subscription.user.email,
            type: label,
            subscription,
        })


    })
}