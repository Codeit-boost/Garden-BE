const { ErrorCodes, CustomError } = require('../utils/error');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getMissions = async(req, res) => {
    const userId = req.user.id;

  try {
    const missions = await prisma.mission.findMany({
      where: { 
        memberId: Number(userId)
      },
      include: { 
        flower: true 
      },
      orderBy: { id: 'desc' },
    });

    res.json(missions);
  } catch (error) {
    throw new CustomError(
      ErrorCodes.InternalServerError, 
      '미션 목록 조회 중 오류가 발생했습니다.'
    );
  }
};

 module.exports = {
    getMissions,
 };