import { EditFilled, EllipsisOutlined } from '@ant-design/icons';
import { Badge, Divider, Dropdown, MenuProps, message, Space, Tooltip, Typography } from 'antd';
import dayjs from 'dayjs';
import _ from 'lodash';
import { useEffect, useState } from 'react';
import { deleteComment, updateComment } from '../../../apis/service/posts';
import PrimaryButton from '../../../components/custom/button/PrimaryButton';
import PrimaryCard from '../../../components/custom/card/PrimaryCard';
import ReplyCommentIcon from '../../../components/custom/icon/ReplyCommentIcon';
import SharedAvatarAuthUser from '../../../components/shared/SharedAvatar';
import { isLoggedIn } from '../../../helper/authhelper';
import Commenteditor from './CommentEditor';
import CommentUpdateEditor from './CommentUpdateEditor';

interface CommentCardProps {
  addComment: (comment: any) => void;
  removeComment: (comment: { parent: any; _id: any }) => void;
  editComment: (comment: { parent: any; _id: any }) => void;
  comment: any;
  commentChild?: any[];
  depth: number;
}

export default function CommentCard(props: CommentCardProps) {
  const { addComment, removeComment, commentChild, editComment, depth } = props ?? {};
  const [replying, setReplying] = useState(false);
  const [editing, setEditing] = useState(false);
  const [comment, setComment] = useState(props.comment);

  const user = isLoggedIn();
  const isAuthor = user && user.userId === comment.commenter._id;

  const items: MenuProps['items'] = [
    {
      label: 'Edit',
      key: '1',
      onClick: () => {
        setEditing(true);
      },
    },
    {
      label: 'Delete',
      key: '2',
      danger: true,
      onClick: () => {
        handleDelete();
      },
    },
  ];

  const handleDelete = async () => {
    await deleteComment(comment._id, user);
    message.success('Comment deleted successful');
    removeComment(comment);
  };

  const handleSubmitCommentUpdateEditor = async (values: any) => {
    await updateComment(comment._id, user, values);
    const newCommentData = { ...comment, content: values?.content, edited: true };
    setComment(newCommentData);
    editComment(newCommentData);
    setEditing(false);
    message.success('Comment updated successful');
  };

  return (
    <>
      <PrimaryCard className='bg-main-light my-2'>
        <div className='flex justify-between'>
          <div className='flex items-center gap-2'>
            <SharedAvatarAuthUser userName={comment.commenter.username} />
            <div className='flex gap-2 items-center'>
              <Typography className='text-base flex items-center font-medium'>{comment.commenter.username}</Typography>
              <Badge status='default' />
              <Typography className='flex items-center text-xs font-normal text-gray-600'>
                {dayjs(comment.createdAt).format('DD/MM/YYYY HH:mm')}
              </Typography>
              {comment.edited && (
                <>
                  <Tooltip title='Đã chỉnh sữa'>
                    <Typography className='flex items-center text-xs font-normal text-gray-600'>
                      <EditFilled className='text-gray-400' />
                    </Typography>
                  </Tooltip>
                </>
              )}
            </div>
          </div>
          <Space>
            {/* reply colapse */}
            {depth < 5 ? (
              <>
                {/* editing */}
                {editing ? (
                  <PrimaryButton
                    onClick={() => setEditing(false)}
                    shape={editing ? 'default' : 'circle'}
                    className={`${
                      editing ? 'bg-main-pink text-main-light' : 'bg-main-purple text-main-blue'
                    } flex items-center justify-center `}
                  >
                    Cancel edit <EditFilled className='text-main-blue' />
                  </PrimaryButton>
                ) : null}
                <Space
                  onClick={() => {
                    setReplying(!replying);
                  }}
                >
                  {/* reply */}
                  {!replying ? (
                    <Tooltip destroyTooltipOnHide placement='top' title='Reply'>
                      <PrimaryButton shape='circle' className='bg-main-purple flex items-center justify-center'>
                        <ReplyCommentIcon className='text-main-blue' />
                      </PrimaryButton>
                    </Tooltip>
                  ) : (
                    // <Tooltip destroyTooltipOnHide placement='top' title='Cancel eply'>
                    <PrimaryButton
                      shape={replying ? 'default' : 'circle'}
                      className={`${
                        replying ? 'bg-main-pink text-main-light' : 'bg-main-purple text-main-blue'
                      } flex items-center justify-center `}
                    >
                      Cancel <ReplyCommentIcon />
                    </PrimaryButton>
                    // </Tooltip>
                  )}
                </Space>
              </>
            ) : null}

            {/* dropdown */}
            {user && (isAuthor || user.isAdmin) && (
              <Dropdown
                menu={{ items }}
                placement='bottomRight'
                className=' items-center justify-center scale-90 hover:opacity-70'
                // trigger={['click']}
              >
                <PrimaryButton
                  shape='circle'
                  className='flex items-center justify-center border-none bg-main-purple py-1 text-xl font-medium'
                >
                  <EllipsisOutlined className='text-main-blue' />
                </PrimaryButton>
              </Dropdown>
            )}
          </Space>
        </div>
        {/* content */}
        <div className='flex flex-col items-start mt-2 gap-0'>
          <Typography.Paragraph
            ellipsis={{ rows: 8, expandable: true, symbol: 'xem thêm' }}
            className='text-sm font-normal whitespace-pre-line mb-0'
          >
            {comment.content}
          </Typography.Paragraph>
        </div>
        {/* editing */}
        {!editing ? null : (
          <CommentUpdateEditor onSubmit={handleSubmitCommentUpdateEditor} initialValue={comment.content} />
        )}
        {/* reply comment */}
        {replying ? (
          <>
            <Divider className='my-4' />
            <PrimaryCard
              variant='no-spacing'
              bordered={false}
              className='[&_.ant-card]:mt-0 [&_.ant-card]:border-purple-400'
            >
              <Commenteditor setReplying={setReplying} comment={comment} addComment={addComment} />
            </PrimaryCard>
          </>
        ) : null}

        {/* comment child */}
        {commentChild &&
          _.map(commentChild, (reply, index) => {
            return (
              <div key={reply._id} className='border-t-[1px] border-t-main-purple mt-2 [&_.ant-card]:my-0'>
                <CommentCard
                  comment={reply}
                  depth={depth + 1}
                  addComment={addComment}
                  removeComment={removeComment}
                  editComment={editComment}
                  commentChild={reply?.children}
                />
              </div>
            );
          })}
      </PrimaryCard>
    </>
  );
}
