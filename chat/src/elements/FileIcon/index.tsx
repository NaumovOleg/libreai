import './style.scss';
import { FILE_ICONS } from '@utils';
import { FC } from 'react';

type Props = {
  path: string;
  changes?: { added: number; removed: number };
  type?: 'edit' | 'created' | 'deleted';
  onClick?: () => void;
};

export const FileIcon: FC<Props> = ({ path, changes, type = 'edit', onClick }) => {
  const name = path.split('/').pop() ?? '';
  const ext = path.split('.').pop() ?? '';

  const icon = FILE_ICONS[name] ?? FILE_ICONS[ext];

  return (
    <div className="file-icon" onClick={onClick}>
      {icon && <img src={icon} alt="icon" style={{ width: 15, height: 15 }} />}
      <div className={`name ${type}`}>{name}</div>
      {changes && (
        <>
          <div className="added">+{changes.added}</div>
          <div className="removed">-{changes.removed}</div>
        </>
      )}
    </div>
  );
};
