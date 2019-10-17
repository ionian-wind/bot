const { ViberClient } = require('messaging-api-viber');
const { Router } = require('express');

const messageIncome = require('../messageIncome');

const accessToken = '<accessToken>';

const viber = new ViberClient(accessToken);

/**
 * Нормализация входящего события и передача его боту для обработки
 * @param event
 * @param timestamp - время отправки события от viber
 * @param user - отправитель - пользователь
 * @param content
 */
const viberMessageHandler = async ({ event, timestamp, sender, ...content }) => {
    // https://developers.viber.com/docs/api/rest-bot-api/

    if (event === 'message') {
        // Получение сообщения от пользователя
        // https://developers.viber.com/docs/api/rest-bot-api/#receive-message-from-user

        const {
            message_token, // ID сообщения,
            message // содержимое сообщения
        } = content;

        if (message.type === 'text') {
            // пока обрабатываем только текстовые сообщения
            await viber.sendMessage(sender.id, {
                type: 'text',
                text: await messageIncome(viber, sender, message_token, message.text)
            });
        }
    }
};

const viberRoutes = new Router();

viberRoutes.route('/viber')
    .post(async (req, res, next) => {
        try {
            // Webhook специально обрабатывать не нужно,
            // т.к. viber шлёт это событие для проверки url обработчика событий, когда мы его устанавливаем
            // https://developers.viber.com/docs/api/rest-bot-api/#webhooks
            if (req.body.event !== 'webhook') {
                await viberMessageHandler(req.body);
            }

            res.end();
        } catch (e) {
            next(e);
        }
    });

module.exports = {
    route: viberRoutes,
    hook: url => viber.setWebhook(`${url}/viber`)
};
