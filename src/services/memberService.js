const { PrismaClient } = require('@prisma/client');
const { ErrorCodes, CustomError } = require('../utils/error');

const prisma = new PrismaClient();

const getMembersWithTotalFocusTime = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const results = await prisma.$queryRaw`
    SELECT
      m.id,
      m.name,
      COALESCE(focus_summary.totalFocusTime, 0) AS "totalFocusTime",
      COALESCE(focus_summary.wiltedCount, 0) AS "wiltedCount",
      COALESCE(focus_summary.bloomedCount, 0) AS "bloomedCount"
    FROM "Member" m
    LEFT JOIN (
      SELECT
        ft."memberId",
        SUM(ft.time) AS "totalFocusTime",
        COUNT(CASE WHEN ft.state = 'WILTED' THEN 1 END) AS "wiltedCount",
        COUNT(CASE WHEN ft.state = 'BLOOMED' THEN 1 END) AS "bloomedCount"
      FROM "FocusTime" ft
      GROUP BY ft."memberId"
    ) AS focus_summary
    ON m.id = focus_summary."memberId"
    ORDER BY "totalFocusTime" DESC
    LIMIT ${limit} OFFSET ${offset};
  `;

  // BigInt 변환
  // 프론트로 어떤 형식으로 시간을 보낼 건지 논의 했어용
  // ✅ BigInt 변환 (Number() 사용)
  const formattedResults = results.map(member => ({
    id: Number(member.id),  // BigInt → Number 변환
    name: member.name,
    totalFocusTime: Number(member.totalFocusTime), // BigInt → Number 변환
    wiltedCount: Number(member.wiltedCount), // BigInt → Number 변환
    bloomedCount: Number(member.bloomedCount) // BigInt → Number 변환
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
      Missions: true,
      focusTimes: {
        select: {
          time: true,
        },
      },
    },
  });

  const wiltedCount = await prisma.focusTime.count({
    where: { memberId: memberId, state: "WILTED" }
  });
  
  const bloomedCount = await prisma.focusTime.count({
    where: { memberId: memberId, state: "BLOOMED" }
  });

  member.wiltedCount = wiltedCount;
  member.bloomedCount = bloomedCount;

  if (!member) {
    throw new CustomError(ErrorCodes.NotFound, '해당 회원 정보가 없습니다.');
  }

  // 현재 회원의 집중시간 총합 계산 (FocusTime의 time 필드 합)
  const currentTotalTime = member.focusTimes.reduce((sum, ft) => sum + ft.time, 0);

  member.currentTotalTime = currentTotalTime;
  
  // 다른 회원들의 집중시간 총합 중에서, 현재 회원보다 큰 값들 중 최소값을 찾는 SQL 쿼리
  const result = await prisma.$queryRaw`
    SELECT "memberId", SUM("time") AS "total_time"
    FROM "FocusTime"
    GROUP BY "memberId"
    HAVING SUM("time") > ${currentTotalTime}
    ORDER BY "total_time" ASC
    LIMIT 1
  `;

  // 쿼리 결과가 있을 경우 해당 집중시간 총합을, 없으면 null로 추가
  // BigInt → Number 변환 후 연산
  member.nextTotalTime = result[0]?.total_time ? Number(result[0].total_time) - currentTotalTime : null;

  const { focusTimes, ...data } = member;

  return data;
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