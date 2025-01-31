const { ErrorCodes, CustomError } = require('../utils/error');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getMissions = async(req, res) => {
  const userId = req.user.id;
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
};

 module.exports = {
    getMissions,
 };