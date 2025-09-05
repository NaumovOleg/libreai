import { useChat } from '@hooks';

export const Chat = () => {
  const { sessions } = useChat();
  console.log('++++++++aaaaaaa', sessions);
  return <section>Chat </section>;
};
