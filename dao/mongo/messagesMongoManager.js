import Message from '../models/messageModel';

async function createMessage(messageData) {
  try {
    const message = new Message(messageData);
    await message.save();
    return message;
  } catch (error) {
    throw error;
  }
}

export { createMessage };