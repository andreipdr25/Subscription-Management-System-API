import aj from '../config/arcjet.js'


const  arcjetMiddleware = async (req, res, next) => {
    try {
        const decision = await aj.protect(req, {requested: 1 });

        if (decision.isDenied()) {
            if(decision.reason.isRateLimit()) res.status(401).json({error: 'Rate Limit exceeded'});
            if(decision.reason.isBot()) return res.status(403).json({error: 'Bot detected'});

            return res.status(403).json({error: 'Acces denied'});

        }
        next();
        } catch (error) {
            console.log(`Arcjet Middleware error: ${error.message}`);
            next(error);
        }
}
export default arcjetMiddleware;