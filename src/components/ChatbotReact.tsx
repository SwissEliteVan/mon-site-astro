import { useEffect } from 'react';

const ChatbotReact = () => {
  useEffect(() => {
    const toggleBtn = document.getElementById('chatbot-toggle');
    const closeBtn = document.getElementById('chatbot-close');
    const modal = document.getElementById('chatbot-modal');
    const input = document.getElementById('chatbot-input') as HTMLInputElement;
    const sendBtn = document.getElementById('chatbot-send');
    const messagesContainer = document.getElementById('chatbot-messages');

    if (!toggleBtn || !closeBtn || !modal || !input || !sendBtn || !messagesContainer) return;

    const toggleModal = () => {
      modal.classList.toggle('hidden');
      modal.classList.toggle('flex');
    };

    const addMessage = (text: string, isUser: boolean) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = isUser 
        ? 'bg-blue-600 text-white text-sm p-3 rounded-lg rounded-tr-none self-end max-w-[85%]'
        : 'bg-gray-800 text-gray-200 text-sm p-3 rounded-lg rounded-tl-none self-start max-w-[85%]';
      msgDiv.textContent = text;
      messagesContainer.appendChild(msgDiv);
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    const handleSend = () => {
      const text = input.value.trim();
      if (!text) return;

      addMessage(text, true);
      input.value = '';

      setTimeout(() => {
        const lowerText = text.toLowerCase();
        let response = "Je suis désolé, je ne comprends pas votre demande. Veuillez nous contacter via le formulaire.";
        if (lowerText.includes('prix') || lowerText.includes('tarif')) {
          response = "Nos tarifs pour un site vitrine commencent à 3'000 CHF. Souhaitez-vous un devis ?";
        } else if (lowerText.includes('contact') || lowerText.includes('téléphone')) {
          response = "Vous pouvez nous contacter via la page Contact ou par téléphone au numéro indiqué en bas de page.";
        } else if (lowerText.includes('bonjour') || lowerText.includes('salut')) {
          response = "Bonjour. Que puis-je faire pour vous ?";
        }
        addMessage(response, false);
      }, 600);
    };

    toggleBtn.addEventListener('click', toggleModal);
    closeBtn.addEventListener('click', () => modal.classList.add('hidden'));
    sendBtn.addEventListener('click', handleSend);
    input.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });

    return () => {
      toggleBtn.removeEventListener('click', toggleModal);
      closeBtn.removeEventListener('click', () => modal.classList.add('hidden'));
      sendBtn.removeEventListener('click', handleSend);
      input.removeEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
      });
    };
  }, []);

  return null;
};

export default ChatbotReact;