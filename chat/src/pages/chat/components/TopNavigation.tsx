import { useChat } from '@hooks';

export const TopNavigation = () => {
  const { sessions, session, setSession } = useChat();
  return (
    <div className="top-navigation navigation">
      <div className="sessions">
        {sessions.map((s) => (
          <div onClick={() => setSession(s)} className={`session ${session === s ? 'active' : ''}`}>
            {s}
          </div>
        ))}
      </div>
      <div className="buttons">buttons</div>
    </div>
  );
};
