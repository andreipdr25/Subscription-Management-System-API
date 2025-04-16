import { Router } from 'express';
import {createSubscription, getSubscriptions, getSubscription, getUserSubscriptions} from "../controllers/subscription.crontroller.js";
import  authorize   from "../middlewares/auth.middleware.js";


const subscriptionRouter = Router();

subscriptionRouter.get('/', getSubscriptions);

subscriptionRouter.get('/:id', authorize, getSubscription);

subscriptionRouter.post('/', authorize, createSubscription);

subscriptionRouter.put('/', authorize);

subscriptionRouter.delete('/:id', (req, res) => res.send({title: 'DELETE subscription'}));

subscriptionRouter.get('/user/:id', authorize, getUserSubscriptions);

subscriptionRouter.put('/:id/cancel', (req, res) => res.send({title: 'CANCEL subscription'}));

subscriptionRouter.get('/upcoming-renewals', (req, res) => res.send({title: 'GET upcoming renewals'}));


export default subscriptionRouter;




