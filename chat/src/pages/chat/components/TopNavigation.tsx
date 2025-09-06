import { useChat } from '@hooks';
import IconButton from '@mui/material/IconButton';
import Delete from '@mui/icons-material/Delete';
import Add from '@mui/icons-material/Add';
export const TopNavigation = () => {
  const { sessions, session, setSession, addSession, removeSession } = useChat();

  return (
    <div className="top-navigation navigation">
      <div className="sessions">
        {sessions.map((s) => (
          <div
            key={s}
            onClick={() => {
              setSession(s);
            }}
            className={`session ${session === s ? 'active' : ''}`}
          >
            {s !== session && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  removeSession(s);
                }}
                color="secondary"
              >
                <Delete />
              </IconButton>
            )}
            {s}
          </div>
        ))}
      </div>
      <div className="buttons">
        <IconButton onClick={addSession} color="secondary">
          <Add />
        </IconButton>
      </div>
    </div>
  );
};
