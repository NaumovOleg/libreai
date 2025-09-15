import { ChatMessage, AGENT_ACTIONS, Providers, INSTRUCTION_STATE } from '@utils';
import { FC, Fragment } from 'react';
import { FaRegCopy } from 'react-icons/fa';
import IconButton from '@mui/material/IconButton';
import { FaRobot } from 'react-icons/fa';
import { FiFileMinus } from 'react-icons/fi';
import { FiFilePlus } from 'react-icons/fi';
import { FiFileText } from 'react-icons/fi';
import { HiOutlineCommandLine } from 'react-icons/hi2';
import { FaPlay } from 'react-icons/fa';
import { MdCancel } from 'react-icons/md';
import { FileIcon } from '@elements';

type Props = {
  message: ChatMessage;
  onCopy: () => void;
  onInteractInstruction: (
    state: INSTRUCTION_STATE.accepted | INSTRUCTION_STATE.declined,
    id?: string,
  ) => void;
};
export const MessageNavigation: FC<Props> = ({ message, onCopy, onInteractInstruction }) => {
  const fileButtons = {
    [AGENT_ACTIONS.renameFile]: FiFileText,
    [AGENT_ACTIONS.updateFile]: FiFileText,
    [AGENT_ACTIONS.deleteFile]: FiFileMinus,
    [AGENT_ACTIONS.createFile]: FiFilePlus,
    [AGENT_ACTIONS.executeCommand]: HiOutlineCommandLine,
  };

  const fileActions = [
    AGENT_ACTIONS.createFile,
    AGENT_ACTIONS.updateFile,
    AGENT_ACTIONS.deleteFile,
    AGENT_ACTIONS.createFile,
  ];

  const getAgentTab = () => {
    if (!message.instructions?.length) return null;

    const renderInstruction = (instruction: AgentInstruction) => {
      const ActionIcon = fileButtons[instruction.action];
      return (
        <Fragment>
          <div>
            <FaRobot />
          </div>
          <div className="actions">
            <ActionIcon />:
            {fileActions.includes(instruction.action) && <FileIcon path={instruction.file} />}
            <Fragment>
              <IconButton
                onClick={() => onInteractInstruction(INSTRUCTION_STATE.accepted, instruction.id)}
                className="interaction-button"
              >
                <FaPlay />
              </IconButton>
              <IconButton
                onClick={() => onInteractInstruction(INSTRUCTION_STATE.declined, instruction.id)}
                className="interaction-button"
              >
                <MdCancel />
              </IconButton>
            </Fragment>
          </div>
        </Fragment>
      );
    };

    return message.instructions.map(renderInstruction);
  };

  return (
    <div className="message-navigation">
      <div className="agent">{message.from === Providers.agent && getAgentTab()}</div>
      <div className="general">
        <IconButton onClick={onCopy}>
          <FaRegCopy />
        </IconButton>
      </div>
    </div>
  );
};
