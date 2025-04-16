import Subscription from '../models/subscription.model.js';
import {workflowClient} from "../config/upstash.js";
import {SERVER_URL} from "../config/env.js";



export const getSubscriptions = async (req, res, next) => {
    try {
        const getSubscriptions = await Subscription.find();
        res.status(200).json({success: true, data: getSubscriptions});
    } catch (error) {
        next(error);
    }
}

export const getSubscription = async (req, res, next) => {
    try {
        const getSubscription = await Subscription.findById(req.params.id);

        if (!getSubscription) {
            const error = new Error('No subscription found');
            error.status = 404;
            throw error;
        }

    } catch (error) {
        next(error);
    }
}


export const createSubscription = async (req, res, next) => {
    try {
        const subscription = await Subscription.create({
            ...req.body,
            user: req.user._id,
        });

        const { workflowRunId } = await workflowClient.trigger({
            url: `${SERVER_URL}/api/v1/workflows/subscription/reminder`,
            body: {
                subsciptionId: subscription.id,
            },
            headers: {
                "content-type": "application/json",
            },
            retries: 0,
        })


        res.status(201).json({ success: true, data: subscription });
    } catch (error) {
        next(error);

    }
}

export const getUserSubscriptions = async (req, res, next) => {
    try {
        if (req.user._id != req.params.id) {
            const error = new Error('You are not the owner of this account');
            error.status = 401;
            throw error;
        }
        const subscriptions = await Subscription.find({user: req.params.id})


        res.status(200).json({success: true, data: subscriptions});
    } catch (error) {
        next(error);
    }
};



