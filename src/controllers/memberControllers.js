const { PrismaClient } = require('@prisma/client');
const { ErrorCodes, CustomError } = require('../utils/error');
const asyncHandler = require('../utils/asyncHandler.js');

const prisma = new PrismaClient();

// 현재 회원 정보 조회
const getMyInfo = asyncHandler(async (req, res) => {
  const memberId = req.user.id;
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    include: {
      friendsMember: true,
      friendsFriend: true,
      flowers: true,
      missions: true,
      focusTimes: true,
    },
  });

  if (!member) {
    throw new CustomError(ErrorCodes.NotFound, '해당 회원 정보가 없습니다.');
  }

  res.status(200).json(member);
});

// 현재 회원 정보 수정
const updateMyInfo = asyncHandler(async (req, res) => {
  const memberId = req.user.id;
  const { name, alarm, mode, sound } = req.body;

  const dataToUpdate = {};
  if (name !== undefined) dataToUpdate.name = name;
  if (alarm !== undefined) dataToUpdate.alarm = alarm;
  if (mode !== undefined) dataToUpdate.mode = mode;
  if (sound !== undefined) dataToUpdate.sound = sound;

  const updatedMember = await prisma.member.update({
    where: { id: memberId },
    data: dataToUpdate,
  });

  res.status(200).json(updatedMember);
});

// 현재 회원 삭제
const deleteMyAccount = asyncHandler(async (req, res) => {
  const memberId = req.user.id;

  await prisma.member.delete({
    where: { id: memberId },
  });

  res.status(204).send();
});

// 친구 추가
const makeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const memberId = req.user.id;

  const existingRequest = await prisma.memberFriend.findUnique({
    where: {
      memberId_friendId: {
        memberId,
        friendId,
      },
    },
  });

  if (existingRequest) {
    throw new CustomError(
      ErrorCodes.BadRequest,
      'Friend request already exists or you are already friends.'
    );
  }

  const friendRequest = await prisma.memberFriend.create({
    data: {
      memberId,
      friendId,
    },
  });

  res.status(201).json({ message: 'Friend request sent successfully.', friendRequest });
});

// 친구 삭제
const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.body;
  const memberId = req.user.id;

  await prisma.memberFriend.delete({
    where: {
      memberId_friendId: {
        memberId,
        friendId,
      },
    },
  });

  res.status(204).send();
});

module.exports = {
  getMyInfo,
  updateMyInfo,
  deleteMyAccount,
  makeFriend,
  removeFriend,
};