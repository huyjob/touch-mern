import { AntDesignOutlined, UserOutlined } from '@ant-design/icons';
import { Avatar, Space, Tooltip } from 'antd';
import _ from 'lodash';
import PrimaryButton from '../custom/button/PrimaryButton';
import SharedAvatarAuthUser from './SharedAvatar';

interface SharedAvatarGroupProps {
  UserLikePreview?: any[];
}

export default function SharedAvatarGroup({ UserLikePreview }: SharedAvatarGroupProps) {
  return (
    <Avatar.Group className='[&_.ant-popover]:hidden' maxStyle={{ color: '#f56a00', backgroundColor: '#fde3cf' }}>
      {_.map(UserLikePreview, (user) => {
        const { username } = user;
        return (
          <Avatar key={username} className='flex items-center justify-center object-cover'>
            <SharedAvatarAuthUser userName={username} className='scale-125' />
          </Avatar>
        );
      })}
    </Avatar.Group>
  );
}
