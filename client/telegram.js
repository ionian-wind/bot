const { TelegramClient } = require('messaging-api-telegram');
const { Router } = require('express');

const messageIncome = require('../messageIncome');

const accessToken = '<accessToken>';

const telegram = new TelegramClient(accessToken);

/**
 * Нормализация входящего события и передача его боту для обработки
 * @param content
 */
const telegramMessageHandler = async (content) => {
    // https://core.telegram.org/bots/api

    if (content.message) {
        // Получение сообщения от пользователя
        // https://core.telegram.org/bots/api#message

        const {
            message_id,
            from, // автор сообщения,
            text // содержимое сообщения
        } = content.message;

        // пока обрабатываем только текстовые сообщения
        if (text) {
            await telegram.sendMessage(from.id, await messageIncome(telegram, from, message_id, text));
        }
    }
};

const telegramRoutes = new Router();

telegramRoutes.route('/telegram')
    .post(async (req, res, next) => {
        try {
            await telegramMessageHandler(req.body);

            res.end();
        } catch (e) {
            next(e);
        }
    });

module.exports = {
    route: telegramRoutes,
    hook: url => telegram.setWebhook(`${url}/telegram`)
};
