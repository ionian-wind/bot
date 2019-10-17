const messageIncome = async (api, user, messageId, text) => text.split('').reverse().join('');

module.exports = messageIncome;
