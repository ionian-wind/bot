const { MessengerClient } = require('messaging-api-messenger');
const { Router } = require('express');

const messageIncome = require('../messageIncome');

const verifyToken = '<verifyToken>';
const appId = '<appId>';
const appSecret = '<appSecret>';
const accessToken = '<accessToken>';

const facebook = new MessengerClient({ appSecret, accessToken, appId });

/**
 * Нормализация входящего события и передача его боту для обработки
 * @param sender - отправитель - пользователь
 * @param recipient - получатель - бот
 * @param timestamp - время отправки события от facebook
 * @param content
 */
const facebookMessageHandler = async ({ sender, recipient, timestamp, ...content }) => {
    if (content.message) {
        // Обработка сообщения от пользователя
        // https://developers.facebook.com/docs/messenger-platform/reference/webhook-events/messages

        // В сообщении может быть прислан quick reply
        // https://developers.facebook.com/docs/messenger-platform/send-messages/quick-replies

        const {
            mid, // ID сообщения,
            text // Текст сообщения
        } = content.message;

        // пока обрабатываем только текстовые сообщения
        if (text) {
            await facebook.sendMessage(sender.id, {
                text: await messageIncome(facebook, sender, mid, text)
            });
        }
    }
};

const facebookRoute = new Router();

facebookRoute.route('/facebook')
    .get((req, res) => {
        const {
            'hub.mode': mode,
            'hub.verify_token': token,
            'hub.challenge': challenge
        } = req.query;

        if (mode === 'subscribe' && token === verifyToken) {
            return res.send(challenge);
        }

        return res.status(403).end();
    })
    .post(async (req, res, next) => {
        try {
            if (req.body.object === 'page') {
                const [entry] = req.body.entry;

                if (entry.messaging) {
                    const [message] = entry.messaging;

                    await facebookMessageHandler(message);
                }
            }

            res.end();
        } catch (e) {
            next(e);
        }
    });

module.exports = {
    route: facebookRoute,
    hook: url => facebook.createSubscription({
        callback_url: `${url}/facebook`,
        verify_token: verifyToken,
        fields: [
            'messages',
            'message_deliveries',
            'messaging_postbacks',
            'message_reads'
        ]
    })
};
