const { PrismaClient } = require('@prisma/client');
const { ErrorCodes, CustomError } = require('../utils/error');

const prisma = new PrismaClient();

const getMemberInfo = async (memberId) => {
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

  return member;
};

const updateMemberInfo = async (memberId, dataToUpdate) => {
  return await prisma.member.update({
    where: { id: memberId },
    data: dataToUpdate,
  });
};

const deleteMemberAccount = async (memberId) => {
  return await prisma.member.delete({
    where: { id: memberId },
  });
};

const addFriend = async (memberId, friendId) => {
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

  return await prisma.memberFriend.create({
    data: {
      memberId,
      friendId,
    },
  });
};

const deleteFriend = async (memberId, friendId) => {
  return await prisma.memberFriend.delete({
    where: {
      memberId_friendId: {
        memberId,
        friendId,
      },
    },
  });
};

module.exports = {
  getMemberInfo,
  updateMemberInfo,
  deleteMemberAccount,
  addFriend,
  deleteFriend,
};