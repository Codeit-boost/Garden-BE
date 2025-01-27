const { PrismaClient } = require('@prisma/client');
const { ErrorCodes, CustomError } = require('../utils/error');

const prisma = new PrismaClient();

const getMembersWithTotalFocusTime = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const results = await prisma.$queryRaw`
    SELECT
      m.id,
      m.name,
      COALESCE(SUM(ft.time), 0) AS "totalFocusTime"
    FROM
      "Member" m
    LEFT JOIN
      "FocusTime" ft
    ON
      m.id = ft."memberId"
    GROUP BY
      m.id
    ORDER BY
      "totalFocusTime" DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  // BigInt 변환
  // 프론트로 어떤 형식으로 시간을 보낼 건지 논의 필요!
  const formattedResults = results.map((result) => ({
    ...result,
    totalFocusTime: result.totalFocusTime.toString(), // BigInt를 문자열로 변환
  }));

  return formattedResults;
};

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
  getMembersWithTotalFocusTime,
  getMemberInfo,
  updateMemberInfo,
  deleteMemberAccount,
  addFriend,
  deleteFriend,
};