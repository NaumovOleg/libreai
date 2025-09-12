import './style.scss';
import { FILE_ICONS } from '@utils';
import { FC } from 'react';

type Props = {
  path: string;
};

export const FileIcon: FC<Props> = ({ path }) => {
  const name = path.split('/').pop() ?? '';
  const ext = path.split('.').pop() ?? '';

  const icon = FILE_ICONS[name] ?? FILE_ICONS[ext];

  return (
    <div className="file-icon">
      {icon && <img src={icon} alt="icon" style={{ width: 15, height: 15 }} />}
      <div className="name">{name}</div>
    </div>
  );
};
